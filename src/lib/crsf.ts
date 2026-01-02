/* eslint-disable @typescript-eslint/no-explicit-any */
import { GPSData, AttitudeData, BatteryData, LinkStats, VarioData } from '../types';

export class CRSF {
    port: any = null;
    reader: any = null;
    isConnected: boolean = false;
    buffer: Uint8Array = new Uint8Array(256);
    bufferIndex: number = 0;
    callbacks: { [key: string]: (data: any) => void } = {};

    readonly CRSF_SYNC_BYTE = 0xC8;

    readonly CRSF_FRAMETYPE_GPS = 0x02;
    readonly CRSF_FRAMETYPE_VARIO = 0x07;
    readonly CRSF_FRAMETYPE_BATTERY_SENSOR = 0x08;
    readonly CRSF_FRAMETYPE_BARO_ALTITUDE = 0x09;
    readonly CRSF_FRAMETYPE_HEARTBEAT = 0x0B;
    readonly CRSF_FRAMETYPE_LINK_STATISTICS = 0x14;
    readonly CRSF_FRAMETYPE_RC_CHANNELS_PACKED = 0x16;
    readonly CRSF_FRAMETYPE_ATTITUDE = 0x1E;
    readonly CRSF_FRAMETYPE_FLIGHT_MODE = 0x21;

    telemetryData: any = {
        gps: null,
        battery: null,
        attitude: null,
        vario: null,
        linkStats: null,
        flightMode: null
    };

    async connect(baudRate = 420000, port: any = null) {
        if (!('serial' in navigator)) {
            throw new Error('Web Serial API not supported');
        }

        try {
            if (port) {
                this.port = port;
            } else {
                this.port = await navigator.serial.requestPort();
            }

            await this.port.open({
                baudRate: baudRate,
                dataBits: 8,
                stopBits: 1,
                parity: 'none',
                flowControl: 'none'
            });

            this.isConnected = true;
            this.startReading();
            return true;
        } catch (error) {
            console.error('CRSF connection error:', error);
            throw error;
        }
    }

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

    async startReading() {
        if (!this.port || !this.port.readable) return;

        const reader = this.port.readable.getReader();
        this.reader = reader;

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                this.processData(value);
            }
        } catch (error) {
            console.error('CRSF read error:', error);
        } finally {
            reader.releaseLock();
        }
    }

    processData(data: Uint8Array) {
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];

            if (this.bufferIndex === 0 && byte !== this.CRSF_SYNC_BYTE) {
                continue;
            }

            if (this.bufferIndex < this.buffer.length) {
                this.buffer[this.bufferIndex++] = byte;
            }

            if (this.bufferIndex >= 2) {
                const frameLength = this.buffer[1];
                const totalLength = frameLength + 2;

                if (this.bufferIndex >= totalLength) {
                    const frame = this.buffer.slice(0, totalLength);
                    if (this.verifyCRC(frame)) {
                        this.parseFrame(frame);
                    }
                    this.buffer.copyWithin(0, totalLength, this.bufferIndex);
                    this.bufferIndex -= totalLength;
                }
            }
        }
    }

    verifyCRC(frame: Uint8Array) {
        const crcData = frame.slice(2, frame.length - 1);
        const receivedCRC = frame[frame.length - 1];
        const calculatedCRC = this.crc8(crcData);
        return receivedCRC === calculatedCRC;
    }

    crc8(data: Uint8Array) {
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

    parseFrame(frame: Uint8Array) {
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
        }
    }

    parseGPS(payload: Uint8Array) {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        const gpsData: GPSData = {
            lat: data.getInt32(0, false) / 10000000,
            lon: data.getInt32(4, false) / 10000000,
            speed: data.getUint16(8, false) / 36, // Convert to km/h
            heading: data.getUint16(10, false) / 100,
            alt: data.getUint16(12, false) - 1000,
            numSat: data.getUint8(14),
            fix: 1 // Assume fix if getting data via CRSF
        };
        this.telemetryData.gps = gpsData;
        if (this.callbacks.gps) this.callbacks.gps(gpsData);
    }

    parseBattery(payload: Uint8Array) {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        const batteryData: BatteryData = {
            voltage: data.getUint16(0, false) / 10,
            current: data.getUint16(2, false) / 10,
            capacity: data.getUint32(4, false) >> 8,
            // remaining: data.getUint8(7)
        };
        this.telemetryData.battery = batteryData;
        if (this.callbacks.battery) this.callbacks.battery(batteryData);
    }

    parseAttitude(payload: Uint8Array) {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        const attitudeData: AttitudeData = {
            pitch: data.getInt16(0, false) / 10000,
            roll: data.getInt16(2, false) / 10000,
            yaw: data.getInt16(4, false) / 10000
        };
        this.telemetryData.attitude = attitudeData;
        if (this.callbacks.attitude) this.callbacks.attitude(attitudeData);
    }

    parseVario(payload: Uint8Array) {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        const varioData: VarioData = {
            verticalSpeed: data.getInt16(0, false) / 10
        };
        this.telemetryData.vario = varioData;
        if (this.callbacks.vario) this.callbacks.vario(varioData);
    }

    parseLinkStatistics(payload: Uint8Array) {
        // payload is Uint8Array
        const linkStats: LinkStats = {
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
        if (this.callbacks.linkStats) this.callbacks.linkStats(linkStats);
    }

    parseFlightMode(payload: Uint8Array) {
        // Convert Uint8Array to string
        let mode = '';
        for (let i = 0; i < payload.length; i++) {
            if (payload[i] === 0) break;
            mode += String.fromCharCode(payload[i]);
        }
        this.telemetryData.flightMode = mode;
        if (this.callbacks.flightMode) this.callbacks.flightMode(mode);
    }

    on(type: string, callback: (data: any) => void) {
        this.callbacks[type] = callback;
    }
}
