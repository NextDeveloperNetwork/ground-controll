import { TelemetryData } from '../types';

interface TelemetryPanelProps {
    data: TelemetryData;
}

export default function TelemetryPanel({ data }: TelemetryPanelProps) {
    const formatValue = (val: number | undefined, decimals: number = 1, unit: string = '') => {
        if (val === undefined || val === null) return '--';
        return `${val.toFixed(decimals)} ${unit}`;
    };

    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
            <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                    <span className="text-blue-400">📊</span> Live Data
                </h3>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${data.armed ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {data.armed ? 'ARMED' : 'DISARMED'}
                </span>
            </div>

            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-4 overflow-y-auto">
                {/* GPS */}
                <div className="col-span-2 md:col-span-4 lg:col-span-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">GPS</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <MetricBox label="Status" value={data.gps.fix ? `${data.gps.fix}D Fix` : 'No Fix'} highlight={!!data.gps.fix} />
                        <MetricBox label="Satellites" value={data.gps.numSat || 0} />
                        <MetricBox label="Latitude" value={formatValue(data.gps.lat, 6)} />
                        <MetricBox label="Longitude" value={formatValue(data.gps.lon, 6)} />
                    </div>
                </div>

                {/* Flight */}
                <div className="col-span-2 md:col-span-4 lg:col-span-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 pt-2 border-t border-slate-800">Flight</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <MetricBox label="Altitude" value={formatValue(data.altitude, 1, 'm')} />
                        <MetricBox label="Speed" value={formatValue(data.gps.speed, 1, 'km/h')} />
                        <MetricBox label="Heading" value={formatValue(data.attitude.yaw, 0, '°')} />
                        <MetricBox label="Vario" value={formatValue(data.vario, 1, 'm/s')} />
                    </div>
                </div>

                {/* Power */}
                <div className="col-span-2 md:col-span-4 lg:col-span-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 pt-2 border-t border-slate-800">Power</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <MetricBox label="Battery" value={formatValue(data.battery.voltage, 1, 'V')}
                            color={data.battery.voltage < 14 ? 'text-red-400' : 'text-blue-400'} />
                        <MetricBox label="Current" value={formatValue(data.battery.current, 1, 'A')} />
                        <MetricBox label="Capacity" value={formatValue(data.battery.capacity, 0, 'mAh')} />
                        <MetricBox label="Used" value={formatValue(data.battery.mAhDrawn, 0, 'mAh')} />
                    </div>
                </div>

                {/* Link */}
                <div className="col-span-2 md:col-span-4 lg:col-span-2">
                    <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 pt-2 border-t border-slate-800">Radio Link</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <MetricBox label="RSSI" value={formatValue(data.rssi, 0, 'dBm')} />
                        <MetricBox label="Link Qual" value={data.linkStats?.uplinkLinkQuality ? `${data.linkStats.uplinkLinkQuality}%` : '--'} />
                        <MetricBox label="Tx Power" value={data.linkStats?.uplinkTXPower !== undefined ? `${data.linkStats.uplinkTXPower}` : '--'} />
                        <MetricBox label="Mode" value={data.flightMode || 'WAITING'} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricBox({ label, value, highlight = false, color = 'text-slate-200' }: { label: string, value: string | number, highlight?: boolean, color?: string }) {
    return (
        <div className="bg-slate-950/50 p-2 rounded border border-slate-800 flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase">{label}</span>
            <span className={`font-mono text-lg font-medium leading-tight truncate ${highlight ? 'text-green-400' : color}`}>
                {value}
            </span>
        </div>
    );
}
