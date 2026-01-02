/**
 * CRSF (Crossfire) Protocol Implementation for ExpressLRS
 * Handles telemetry data from ExpressLRS receiver
 */

class CRSF {
    constructor() {
        this.port = null;
        this.reader = null;
        this.isConnected = false;
        this.buffer = new Uint8Array(256);
        this.bufferIndex = 0;
        this.callbacks = {};

        // CRSF Protocol Constants
        this.CRSF_SYNC_BYTE = 0xC8;

        // Frame types
        this.CRSF_FRAMETYPE_GPS = 0x02;
        this.CRSF_FRAMETYPE_VARIO = 0x07;
        this.CRSF_FRAMETYPE_BATTERY_SENSOR = 0x08;
        this.CRSF_FRAMETYPE_BARO_ALTITUDE = 0x09;
        this.CRSF_FRAMETYPE_HEARTBEAT = 0x0B;
        this.CRSF_FRAMETYPE_LINK_STATISTICS = 0x14;
        this.CRSF_FRAMETYPE_RC_CHANNELS_PACKED = 0x16;
        this.CRSF_FRAMETYPE_ATTITUDE = 0x1E;
        this.CRSF_FRAMETYPE_FLIGHT_MODE = 0x21;

        // Device addresses
        this.CRSF_ADDRESS_BROADCAST = 0x00;
        this.CRSF_ADDRESS_USB = 0x10;
        this.CRSF_ADDRESS_TBS_CORE_PNP_PRO = 0x80;
        this.CRSF_ADDRESS_RESERVED1 = 0x8A;
        this.CRSF_ADDRESS_CURRENT_SENSOR = 0xC0;
        this.CRSF_ADDRESS_GPS = 0xC2;
        this.CRSF_ADDRESS_TBS_BLACKBOX = 0xC4;
        this.CRSF_ADDRESS_FLIGHT_CONTROLLER = 0xC8;
        this.CRSF_ADDRESS_RESERVED2 = 0xCA;
        this.CRSF_ADDRESS_RACE_TAG = 0xCC;
        this.CRSF_ADDRESS_RADIO_TRANSMITTER = 0xEA;
        this.CRSF_ADDRESS_CRSF_RECEIVER = 0xEC;
        this.CRSF_ADDRESS_CRSF_TRANSMITTER = 0xEE;

        this.telemetryData = {
            gps: null,
            battery: null,
            attitude: null,
            vario: null,
            linkStats: null,
            flightMode: null
        };
    }

    /**
     * Connect to ExpressLRS receiver
     */
    async connect(baudRate = 420000, port = null) {
        if (!('serial' in navigator)) {
            throw new Error('Web Serial API not supported. Please use Chrome, Edge, or Opera.');
        }

        try {
            if (port) {
                this.port = port;
            } else {
                // Request port from user
                this.port = await navigator.serial.requestPort();
            }

            // Open port with ELRS baud rate (typically 420000)
            await this.port.open({
                baudRate: baudRate,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none'
            });

            this.isConnected = true;

            // Start reading
            this.startReading();

            console.log('Connected to ExpressLRS receiver');
            return true;
        } catch (error) {
            console.error('CRSF connection error:', error);
            throw error;
        }
    }

    /**
     * Disconnect from receiver
     */
    async disconnect() {
        if (this.reader) {
            await this.reader.cancel();
            this.reader = null;
        }

        if (this.port) {
            await this.port.close();
            this.port = null;
        }

        this.isConnected = false;
    }

    /**
     * Start reading data from serial port
     */
    async startReading() {
        const reader = this.port.readable.getReader();
        this.reader = reader;

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    break;
                }

                // Process received data
                this.processData(value);
            }
        } catch (error) {
            console.error('CRSF read error:', error);
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Process incoming data
     */
    processData(data) {
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];

            // Look for sync byte
            if (this.bufferIndex === 0 && byte !== this.CRSF_SYNC_BYTE) {
                continue;
            }

            // Add to buffer
            if (this.bufferIndex < this.buffer.length) {
                this.buffer[this.bufferIndex++] = byte;
            }

            // Check if we have enough data for frame length
            if (this.bufferIndex >= 2) {
                const frameLength = this.buffer[1];
                const totalLength = frameLength + 2; // sync + length + payload + crc

                // Check if we have complete frame
                if (this.bufferIndex >= totalLength) {
                    // Extract frame
                    const frame = this.buffer.slice(0, totalLength);

                    // Verify CRC
                    if (this.verifyCRC(frame)) {
                        this.parseFrame(frame);
                    } else {
                        console.warn('CRSF CRC mismatch');
                    }

                    // Remove processed frame from buffer
                    this.buffer.copyWithin(0, totalLength, this.bufferIndex);
                    this.bufferIndex -= totalLength;
                }
            }
        }
    }

    /**
     * Verify CRC8 checksum
     */
    verifyCRC(frame) {
        const crcData = frame.slice(2, frame.length - 1);
        const receivedCRC = frame[frame.length - 1];
        const calculatedCRC = this.crc8(crcData);
        return receivedCRC === calculatedCRC;
    }

    /**
     * Calculate CRC8-DVB-S2
     */
    crc8(data) {
        let crc = 0;
        for (let i = 0; i < data.length; i++) {
            crc ^= data[i];
            for (let j = 0; j < 8; j++) {
                if (crc & 0x80) {
                    crc = (crc << 1) ^ 0xD5;
                } else {
                    crc = crc << 1;
                }
            }
        }
        return crc & 0xFF;
    }

    /**
     * Parse CRSF frame
     */
    parseFrame(frame) {
        const frameType = frame[2];
        const payload = frame.slice(3, frame.length - 1);

        switch (frameType) {
            case this.CRSF_FRAMETYPE_GPS:
                this.parseGPS(payload);
                break;
            case this.CRSF_FRAMETYPE_BATTERY_SENSOR:
                this.parseBattery(payload);
                break;
            case this.CRSF_FRAMETYPE_ATTITUDE:
                this.parseAttitude(payload);
                break;
            case this.CRSF_FRAMETYPE_VARIO:
                this.parseVario(payload);
                break;
            case this.CRSF_FRAMETYPE_LINK_STATISTICS:
                this.parseLinkStatistics(payload);
                break;
            case this.CRSF_FRAMETYPE_FLIGHT_MODE:
                this.parseFlightMode(payload);
                break;
            case this.CRSF_FRAMETYPE_HEARTBEAT:
                // Heartbeat received
                break;
        }
    }

    /**
     * Parse GPS telemetry
     */
    parseGPS(payload) {
        const data = new DataView(payload.buffer, payload.byteOffset);

        const gpsData = {
            lat: data.getInt32(0, false) / 10000000,
            lon: data.getInt32(4, false) / 10000000,
            speed: data.getUint16(8, false) / 36, // Convert to km/h
            heading: data.getUint16(10, false) / 100,
            altitude: data.getUint16(12, false) - 1000,
            satellites: data.getUint8(14)
        };

        this.telemetryData.gps = gpsData;

        if (this.callbacks.gps) {
            this.callbacks.gps(gpsData);
        }
    }

    /**
     * Parse battery telemetry
     */
    parseBattery(payload) {
        const data = new DataView(payload.buffer, payload.byteOffset);

        const batteryData = {
            voltage: data.getUint16(0, false) / 10,
            current: data.getUint16(2, false) / 10,
            capacity: data.getUint32(4, false) >> 8, // 24-bit value
            remaining: data.getUint8(7)
        };

        this.telemetryData.battery = batteryData;

        if (this.callbacks.battery) {
            this.callbacks.battery(batteryData);
        }
    }

    /**
     * Parse attitude telemetry
     */
    parseAttitude(payload) {
        const data = new DataView(payload.buffer, payload.byteOffset);

        const attitudeData = {
            pitch: data.getInt16(0, false) / 10000,
            roll: data.getInt16(2, false) / 10000,
            yaw: data.getInt16(4, false) / 10000
        };

        this.telemetryData.attitude = attitudeData;

        if (this.callbacks.attitude) {
            this.callbacks.attitude(attitudeData);
        }
    }

    /**
     * Parse variometer telemetry
     */
    parseVario(payload) {
        const data = new DataView(payload.buffer, payload.byteOffset);

        const varioData = {
            verticalSpeed: data.getInt16(0, false) / 10 // cm/s to m/s
        };

        this.telemetryData.vario = varioData;

        if (this.callbacks.vario) {
            this.callbacks.vario(varioData);
        }
    }

    /**
     * Parse link statistics
     */
    parseLinkStatistics(payload) {
        const data = new DataView(payload.buffer, payload.byteOffset);

        const linkStats = {
            uplinkRSSI1: -payload[0],
            uplinkRSSI2: -payload[1],
            uplinkLinkQuality: payload[2],
            uplinkSNR: payload[3],
            activeAntenna: payload[4],
            rfMode: payload[5],
            uplinkTXPower: payload[6],
            downlinkRSSI: -payload[7],
            downlinkLinkQuality: payload[8],
            downlinkSNR: payload[9]
        };

        this.telemetryData.linkStats = linkStats;

        if (this.callbacks.linkStats) {
            this.callbacks.linkStats(linkStats);
        }
    }

    /**
     * Parse flight mode
     */
    parseFlightMode(payload) {
        const mode = String.fromCharCode(...payload).replace(/\0/g, '');

        this.telemetryData.flightMode = mode;

        if (this.callbacks.flightMode) {
            this.callbacks.flightMode(mode);
        }
    }

    /**
     * Register callback for telemetry type
     */
    on(type, callback) {
        this.callbacks[type] = callback;
    }

    /**
     * Get all telemetry data
     */
    getTelemetry() {
        return this.telemetryData;
    }
}

// Export for use in main app
window.CRSF = CRSF;
