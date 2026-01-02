export interface GPSData {
    fix: number;
    numSat: number;
    lat: number;
    lon: number;
    alt: number; // m
    speed: number; // km/h
    heading: number; // deg
    groundCourse?: number;
    satellites?: number;
}

export interface AttitudeData {
    roll: number;
    pitch: number;
    yaw: number;
}

export interface BatteryData {
    voltage: number;
    current: number;
    capacity?: number;
    mAhDrawn?: number;
    amperage?: number;
    batteryVoltage?: number;
    vbat?: number;
    rssi?: number;
    cellCount?: number;
    batteryState?: number;
}

export interface AltitudeData {
    estimatedAltitude: number; // cm
    estimatedVario?: number; // cm/s
}

export interface VarioData {
    verticalSpeed: number;
}

export interface LinkStats {
    uplinkRSSI1?: number;
    downlinkRSSI?: number;
    uplinkLinkQuality?: number;
    uplinkTXPower?: number;
    [key: string]: number | undefined;
}

export interface TelemetryData {
    gps: GPSData;
    attitude: AttitudeData;
    battery: BatteryData;
    altitude: number; // m
    vario: number; // m/s
    rssi: number;
    linkStats?: LinkStats;
    flightMode: string;
    armed: boolean;
    timestamp?: string;
}

export interface Settings {
    mapProvider: 'osm' | 'satellite' | 'terrain';
    distanceUnit: 'metric' | 'imperial';
    speedUnit: 'kmh' | 'mph' | 'ms';
    autoRecord: boolean;
    logInterval: number;
}
