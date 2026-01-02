/**
 * MSP (MultiWii Serial Protocol) Implementation for iNav 8.0.1
 * Handles direct USB communication with SpeedyBee F405 Wing FC
 */

class MSP {
    constructor() {
        this.port = null;
        this.reader = null;
        this.writer = null;
        this.isConnected = false;
        this.buffer = new Uint8Array(256);
        this.bufferIndex = 0;
        this.callbacks = {};

        // MSP Protocol Constants
        this.MSP_HEADER = 0x24; // '$'
        this.MSP_V1 = 0x4D; // 'M'
        this.MSP_V2_NATIVE = 0x58; // 'X'
        this.MSP_DIRECTION_REQUEST = 0x3C; // '<'
        this.MSP_DIRECTION_RESPONSE = 0x3E; // '>'

        // MSP Message IDs (iNav specific)
        this.MSP_API_VERSION = 1;
        this.MSP_FC_VARIANT = 2;
        this.MSP_FC_VERSION = 3;
        this.MSP_BOARD_INFO = 4;
        this.MSP_BUILD_INFO = 5;

        this.MSP_STATUS = 101;
        this.MSP_RAW_IMU = 102;
        this.MSP_SERVO = 103;
        this.MSP_MOTOR = 104;
        this.MSP_RC = 105;
        this.MSP_RAW_GPS = 106;
        this.MSP_COMP_GPS = 107;
        this.MSP_ATTITUDE = 108;
        this.MSP_ALTITUDE = 109;
        this.MSP_ANALOG = 110;
        this.MSP_RC_TUNING = 111;
        this.MSP_PID = 112;

        this.MSP_NAV_STATUS = 121;
        this.MSP_NAV_CONFIG = 122;
        this.MSP_GPSSTATISTICS = 166;

        this.MSP_BATTERY_STATE = 130;
        this.MSP_VOLTAGE_METERS = 128;
        this.MSP_CURRENT_METERS = 129;

        this.MSP_RSSI_CONFIG = 50;

        // Flight modes
        this.FLIGHT_MODES = {
            0: 'ARM',
            1: 'ANGLE',
            2: 'HORIZON',
            3: 'NAV ALTHOLD',
            4: 'MAG',
            5: 'HEADFREE',
            6: 'HEADADJ',
            7: 'CAMSTAB',
            8: 'NAV RTH',
            9: 'NAV POSHOLD',
            10: 'MANUAL',
            11: 'BEEPER',
            12: 'LEDS OFF',
            13: 'LIGHTS',
            14: 'NAV LAUNCH',
            15: 'OSD OFF',
            16: 'TELEMETRY',
            17: 'AUTO TUNE',
            18: 'BLACKBOX',
            19: 'FAILSAFE',
            20: 'NAV WP',
            21: 'AIR MODE',
            22: 'HOME RESET',
            23: 'GCS NAV',
            24: 'FPV ANGLE MIX',
            25: 'SURFACE',
            26: 'FLAPERON',
            27: 'TURN ASSIST',
            28: 'NAV CRUISE',
            29: 'AUTO LEVEL TRIM',
            30: 'SERVO AUTOTRIM',
            31: 'CAMERA CONTROL 1',
            32: 'CAMERA CONTROL 2',
            33: 'CAMERA CONTROL 3',
            34: 'OSD ALT 1',
            35: 'OSD ALT 2',
            36: 'OSD ALT 3',
            37: 'NAV COURSE HOLD',
            38: 'MC BRAKING',
            39: 'USER1',
            40: 'USER2',
            41: 'USER3',
            42: 'USER4',
            43: 'LOITER CHANGE',
            44: 'MSP RC OVERRIDE',
            45: 'PREARM',
            46: 'TURTLE',
            47: 'NAV WP MULTI MISSION',
            48: 'ANGLE HOLD',
            49: 'SOARING'
        };
    }

    /**
     * Request available serial ports
     */
    async getAvailablePorts() {
        if ('serial' in navigator) {
            try {
                const ports = await navigator.serial.getPorts();
                return ports;
            } catch (error) {
                console.error('Error getting ports:', error);
                return [];
            }
        } else {
            throw new Error('Web Serial API not supported');
        }
    }

    /**
     * Connect to flight controller
     */
    async connect(baudRate = 115200, port = null) {
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

            // Open port with specified baud rate
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

            // Request initial data
            setTimeout(() => {
                this.requestFCInfo();
            }, 500);

            return true;
        } catch (error) {
            console.error('Connection error:', error);
            throw error;
        }
    }

    /**
     * Disconnect from flight controller
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
            console.error('Read error:', error);
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

            // Add to buffer
            if (this.bufferIndex < this.buffer.length) {
                this.buffer[this.bufferIndex++] = byte;
            }

            // Check for complete message
            if (this.bufferIndex >= 6) {
                if (this.buffer[0] === this.MSP_HEADER &&
                    this.buffer[1] === this.MSP_V1 &&
                    this.buffer[2] === this.MSP_DIRECTION_RESPONSE) {

                    const payloadSize = this.buffer[3];
                    const messageLength = 6 + payloadSize;

                    if (this.bufferIndex >= messageLength) {
                        // Extract message
                        const message = this.buffer.slice(0, messageLength);
                        this.parseMessage(message);

                        // Remove processed message from buffer
                        this.buffer.copyWithin(0, messageLength, this.bufferIndex);
                        this.bufferIndex -= messageLength;
                    }
                }
            }
        }
    }

    /**
     * Parse MSP message
     */
    parseMessage(message) {
        const payloadSize = message[3];
        const code = message[4];
        const payload = message.slice(5, 5 + payloadSize);

        // Verify checksum
        let checksum = payloadSize ^ code;
        for (let i = 0; i < payloadSize; i++) {
            checksum ^= payload[i];
        }

        if (checksum !== message[5 + payloadSize]) {
            console.error('Checksum mismatch');
            return;
        }

        // Trigger callback
        if (this.callbacks[code]) {
            this.callbacks[code](payload);
        }
    }

    /**
     * Send MSP request
     */
    async sendRequest(code, payload = []) {
        if (!this.isConnected || !this.port) {
            throw new Error('Not connected');
        }

        const payloadSize = payload.length;
        const message = new Uint8Array(6 + payloadSize);

        message[0] = this.MSP_HEADER; // '$'
        message[1] = this.MSP_V1; // 'M'
        message[2] = this.MSP_DIRECTION_REQUEST; // '<'
        message[3] = payloadSize;
        message[4] = code;

        // Add payload
        for (let i = 0; i < payloadSize; i++) {
            message[5 + i] = payload[i];
        }

        // Calculate checksum
        let checksum = payloadSize ^ code;
        for (let i = 0; i < payloadSize; i++) {
            checksum ^= payload[i];
        }
        message[5 + payloadSize] = checksum;

        // Send message
        const writer = this.port.writable.getWriter();
        await writer.write(message);
        writer.releaseLock();
    }

    /**
     * Register callback for message type
     */
    onMessage(code, callback) {
        this.callbacks[code] = callback;
    }

    /**
     * Request flight controller information
     */
    async requestFCInfo() {
        await this.sendRequest(this.MSP_API_VERSION);
        await this.sendRequest(this.MSP_FC_VARIANT);
        await this.sendRequest(this.MSP_FC_VERSION);
        await this.sendRequest(this.MSP_BOARD_INFO);
    }

    /**
     * Request telemetry data
     */
    async requestTelemetry() {
        if (!this.isConnected) return;

        try {
            await this.sendRequest(this.MSP_STATUS);
            await this.sendRequest(this.MSP_RAW_GPS);
            await this.sendRequest(this.MSP_ATTITUDE);
            await this.sendRequest(this.MSP_ALTITUDE);
            await this.sendRequest(this.MSP_ANALOG);
            await this.sendRequest(this.MSP_BATTERY_STATE);
            await this.sendRequest(this.MSP_NAV_STATUS);
        } catch (error) {
            console.error('Error requesting telemetry:', error);
        }
    }

    /**
     * Parse GPS data
     */
    parseGPS(payload) {
        const data = new DataView(payload.buffer);

        return {
            fix: data.getUint8(0),
            numSat: data.getUint8(1),
            lat: data.getInt32(2, true) / 10000000,
            lon: data.getInt32(6, true) / 10000000,
            alt: data.getInt16(10, true),
            speed: data.getUint16(12, true),
            groundCourse: data.getUint16(14, true)
        };
    }

    /**
     * Parse attitude data
     */
    parseAttitude(payload) {
        const data = new DataView(payload.buffer);

        return {
            roll: data.getInt16(0, true) / 10,
            pitch: data.getInt16(2, true) / 10,
            yaw: data.getInt16(4, true)
        };
    }

    /**
     * Parse altitude data
     */
    parseAltitude(payload) {
        const data = new DataView(payload.buffer);

        return {
            estimatedAltitude: data.getInt32(0, true),
            estimatedVario: data.getInt16(4, true)
        };
    }

    /**
     * Parse analog/battery data
     */
    parseAnalog(payload) {
        const data = new DataView(payload.buffer);

        return {
            vbat: data.getUint8(0) / 10,
            mAhDrawn: data.getUint16(1, true),
            rssi: data.getUint16(3, true),
            amperage: data.getInt16(5, true) / 100
        };
    }

    /**
     * Parse status data
     */
    parseStatus(payload) {
        const data = new DataView(payload.buffer);

        const cycleTime = data.getUint16(0, true);
        const i2cErrorsCount = data.getUint16(2, true);
        const sensors = data.getUint16(4, true);
        const flags = data.getUint32(6, true);
        const currentProfile = data.getUint8(10);

        // Parse active flight modes
        const activeModes = [];
        for (let i = 0; i < 50; i++) {
            if (flags & (1 << i)) {
                if (this.FLIGHT_MODES[i]) {
                    activeModes.push(this.FLIGHT_MODES[i]);
                }
            }
        }

        return {
            cycleTime,
            i2cErrorsCount,
            sensors,
            flags,
            currentProfile,
            activeModes,
            armed: (flags & 1) !== 0
        };
    }

    /**
     * Parse battery state
     */
    parseBatteryState(payload) {
        const data = new DataView(payload.buffer);

        return {
            cellCount: data.getUint8(0),
            capacity: data.getUint16(1, true),
            voltage: data.getUint8(3) / 10,
            mAhDrawn: data.getUint16(4, true),
            amperage: data.getUint16(6, true) / 100,
            batteryState: data.getUint8(8),
            batteryVoltage: data.getUint16(9, true) / 100
        };
    }

    /**
     * Parse navigation status
     */
    parseNavStatus(payload) {
        const data = new DataView(payload.buffer);

        return {
            mode: data.getUint8(0),
            state: data.getUint8(1),
            activeWpAction: data.getUint8(2),
            activeWpNumber: data.getUint8(3),
            error: data.getUint8(4),
            heading: data.getInt16(5, true)
        };
    }
}

// Export for use in main app
window.MSP = MSP;
