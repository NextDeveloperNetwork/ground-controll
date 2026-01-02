/* eslint-disable @typescript-eslint/no-explicit-any */
import { GPSData, AttitudeData, AltitudeData, BatteryData } from '../types';

declare global {
    interface Navigator {
        serial: any;
    }
}

export class MSP {
    port: any = null;
    reader: any = null;
    writer: any = null;
    isConnected: boolean = false;
    buffer: Uint8Array = new Uint8Array(256);
    bufferIndex: number = 0;
    callbacks: { [key: number]: (payload: Uint8Array) => void } = {};

    // MSP Protocol Constants
    readonly MSP_HEADER = 0x24; // '$'
    readonly MSP_V1 = 0x4D; // 'M'
    readonly MSP_V2_NATIVE = 0x58; // 'X'
    readonly MSP_DIRECTION_REQUEST = 0x3C; // '<'
    readonly MSP_DIRECTION_RESPONSE = 0x3E; // '>'

    // MSP Message IDs (iNav specific)
    readonly MSP_API_VERSION = 1;
    readonly MSP_FC_VARIANT = 2;
    readonly MSP_FC_VERSION = 3;
    readonly MSP_BOARD_INFO = 4;
    readonly MSP_BUILD_INFO = 5;

    readonly MSP_STATUS = 101;
    readonly MSP_RAW_IMU = 102;
    readonly MSP_SERVO = 103;
    readonly MSP_MOTOR = 104;
    readonly MSP_RC = 105;
    readonly MSP_RAW_GPS = 106;
    readonly MSP_COMP_GPS = 107;
    readonly MSP_ATTITUDE = 108;
    readonly MSP_ALTITUDE = 109;
    readonly MSP_ANALOG = 110;
    readonly MSP_RC_TUNING = 111;
    readonly MSP_PID = 112;

    readonly MSP_NAV_STATUS = 121;
    readonly MSP_NAV_CONFIG = 122;
    readonly MSP_GPSSTATISTICS = 166;

    readonly MSP_BATTERY_STATE = 130;
    readonly MSP_VOLTAGE_METERS = 128;
    readonly MSP_CURRENT_METERS = 129;

    readonly MSP_RSSI_CONFIG = 50;

    readonly FLIGHT_MODES: { [key: number]: string } = {
        0: 'ARM', 1: 'ANGLE', 2: 'HORIZON', 3: 'NAV ALTHOLD', 4: 'MAG', 5: 'HEADFREE',
        6: 'HEADADJ', 7: 'CAMSTAB', 8: 'NAV RTH', 9: 'NAV POSHOLD', 10: 'MANUAL',
        11: 'BEEPER', 12: 'LEDS OFF', 13: 'LIGHTS', 14: 'NAV LAUNCH', 15: 'OSD OFF',
        16: 'TELEMETRY', 17: 'AUTO TUNE', 18: 'BLACKBOX', 19: 'FAILSAFE', 20: 'NAV WP',
        21: 'AIR MODE', 22: 'HOME RESET', 23: 'GCS NAV', 24: 'FPV ANGLE MIX',
        25: 'SURFACE', 26: 'FLAPERON', 27: 'TURN ASSIST', 28: 'NAV CRUISE',
        29: 'AUTO LEVEL TRIM', 30: 'SERVO AUTOTRIM', 31: 'CAMERA CONTROL 1',
        32: 'CAMERA CONTROL 2', 33: 'CAMERA CONTROL 3', 34: 'OSD ALT 1',
        35: 'OSD ALT 2', 36: 'OSD ALT 3', 37: 'NAV COURSE HOLD', 38: 'MC BRAKING',
        39: 'USER1', 40: 'USER2', 41: 'USER3', 42: 'USER4', 43: 'LOITER CHANGE',
        44: 'MSP RC OVERRIDE', 45: 'PREARM', 46: 'TURTLE', 47: 'NAV WP MULTI MISSION',
        48: 'ANGLE HOLD', 49: 'SOARING'
    };

    /**
     * Request available serial ports
     */
    async getAvailablePorts() {
        if (typeof navigator !== 'undefined' && 'serial' in navigator) {
            try {
                const ports = await navigator.serial.getPorts();
                return ports;
            } catch (error) {
                console.error('Error getting ports:', error);
                return [];
            }
        } else {
            console.warn('Web Serial API not supported');
            return [];
        }
    }

    /**
     * Connect to flight controller
     */
    async connect(baudRate = 115200, port: any = null) {
        if (!('serial' in navigator)) {
            throw new Error('Web Serial API not supported. Please use Chrome, Edge, or Opera.');
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

            setTimeout(() => {
                this.requestFCInfo();
            }, 500);

            return true;
        } catch (error) {
            console.error('Connection error:', error);
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
            console.error('Read error:', error);
        } finally {
            reader.releaseLock();
        }
    }

    processData(data: Uint8Array) {
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];

            if (this.bufferIndex < this.buffer.length) {
                this.buffer[this.bufferIndex++] = byte;
            }

            if (this.bufferIndex >= 6) {
                if (this.buffer[0] === this.MSP_HEADER &&
                    this.buffer[1] === this.MSP_V1 &&
                    this.buffer[2] === this.MSP_DIRECTION_RESPONSE) {

                    const payloadSize = this.buffer[3];
                    const messageLength = 6 + payloadSize;

                    if (this.bufferIndex >= messageLength) {
                        const message = this.buffer.slice(0, messageLength);
                        this.parseMessage(message);
                        this.buffer.copyWithin(0, messageLength, this.bufferIndex);
                        this.bufferIndex -= messageLength;
                    }
                }
            }
        }
    }

    parseMessage(message: Uint8Array) {
        const payloadSize = message[3];
        const code = message[4];
        const payload = message.slice(5, 5 + payloadSize);

        let checksum = payloadSize ^ code;
        for (let i = 0; i < payloadSize; i++) {
            checksum ^= payload[i];
        }

        if (checksum !== message[5 + payloadSize]) {
            console.error('Checksum mismatch');
            return;
        }

        if (this.callbacks[code]) {
            this.callbacks[code](payload);
        }
    }

    async sendRequest(code: number, payload: number[] = []) {
        if (!this.isConnected || !this.port) {
            throw new Error('Not connected');
        }

        const payloadSize = payload.length;
        const message = new Uint8Array(6 + payloadSize);

        message[0] = this.MSP_HEADER;
        message[1] = this.MSP_V1;
        message[2] = this.MSP_DIRECTION_REQUEST;
        message[3] = payloadSize;
        message[4] = code;

        for (let i = 0; i < payloadSize; i++) {
            message[5 + i] = payload[i];
        }

        let checksum = payloadSize ^ code;
        for (let i = 0; i < payloadSize; i++) {
            checksum ^= payload[i];
        }
        message[5 + payloadSize] = checksum;

        const writer = this.port.writable.getWriter();
        await writer.write(message);
        writer.releaseLock();
    }

    onMessage(code: number, callback: (payload: Uint8Array) => void) {
        this.callbacks[code] = callback;
    }

    async requestFCInfo() {
        await this.sendRequest(this.MSP_API_VERSION);
        await this.sendRequest(this.MSP_FC_VARIANT);
        await this.sendRequest(this.MSP_FC_VERSION);
        await this.sendRequest(this.MSP_BOARD_INFO);
    }

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

    // Parsing methods
    parseGPS(payload: Uint8Array): GPSData {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        return {
            fix: data.getUint8(0),
            numSat: data.getUint8(1),
            lat: data.getInt32(2, true) / 10000000,
            lon: data.getInt32(6, true) / 10000000,
            alt: data.getInt16(10, true),
            speed: data.getUint16(12, true),
            groundCourse: data.getUint16(14, true),
            heading: data.getUint16(14, true) / 10 // MSP heading is usually decidegrees or mapping course
        };
    }

    parseAttitude(payload: Uint8Array): AttitudeData {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        return {
            roll: data.getInt16(0, true) / 10,
            pitch: data.getInt16(2, true) / 10,
            yaw: data.getInt16(4, true)
        };
    }

    parseAltitude(payload: Uint8Array): AltitudeData {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        return {
            estimatedAltitude: data.getInt32(0, true),
            estimatedVario: data.getInt16(4, true)
        };
    }

    parseAnalog(payload: Uint8Array): BatteryData {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        return {
            vbat: data.getUint8(0) / 10,
            mAhDrawn: data.getUint16(1, true),
            rssi: data.getUint16(3, true),
            amperage: data.getInt16(5, true) / 100,
            voltage: data.getUint8(0) / 10, // alias
            current: data.getInt16(5, true) / 100 // alias
        };
    }

    parseBatteryState(payload: Uint8Array): BatteryData {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        return {
            cellCount: data.getUint8(0),
            capacity: data.getUint16(1, true),
            voltage: data.getUint8(3) / 10,
            mAhDrawn: data.getUint16(4, true),
            amperage: data.getUint16(6, true) / 100,
            batteryState: data.getUint8(8),
            batteryVoltage: data.getUint16(9, true) / 100,
            current: data.getUint16(6, true) / 100 // alias
        };
    }

    parseStatus(payload: Uint8Array) {
        const data = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
        const flags = data.getUint32(6, true);

        const activeModes = [];
        for (let i = 0; i < 50; i++) {
            if (flags & (1 << i)) {
                if (this.FLIGHT_MODES[i]) {
                    activeModes.push(this.FLIGHT_MODES[i]);
                }
            }
        }

        return {
            cycleTime: data.getUint16(0, true),
            i2cErrorsCount: data.getUint16(2, true),
            sensors: data.getUint16(4, true),
            flags,
            currentProfile: data.getUint8(10),
            activeModes,
            armed: (flags & 1) !== 0
        };
    }
}
