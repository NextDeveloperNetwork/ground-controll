'use client';
import { useEffect, useRef, useState } from 'react';
import { USBCamera } from '../lib/usb-camera';
import { Rnd } from 'react-rnd';
import { HorizonWidget, CompassWidget, VarioWidget, AltitudeWidget } from './InstrumentWidgets';
import { AttitudeData, VarioData } from '../types';

interface CameraViewProps {
    usbCamera: USBCamera;
    attitude: AttitudeData;
    altitude: number;
    vario: VarioData;
}

export default function CameraView({ usbCamera, attitude, altitude, vario }: CameraViewProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState('Disconnected');
    const [isConnected, setIsConnected] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [streamUrl, setStreamUrl] = useState('http://192.168.169.1:8080/video.mjpg');
    const [isNetworkStream, setIsNetworkStream] = useState(false);

    // Tools Visibility State
    const [tools, setTools] = useState({
        horizon: true,
        compass: false,
        vario: true,
        altitude: false,
    });

    useEffect(() => {
        if (videoRef.current) {
            usbCamera.setVideoElement(videoRef.current);
        }

        usbCamera.onStatusChange((msg, connected) => {
            setStatus(msg);
            setIsConnected(connected);
            if (!connected) setIsNetworkStream(false);
        });

        usbCamera.autoDetect();
    }, [usbCamera]);

    const handleConnectUSB = async () => {
        const devs = await usbCamera.requestPermission();
        setDevices(devs);
        setIsMenuOpen(true);
    };

    const handleConnectStream = () => {
        setIsNetworkStream(true);
        setIsConnected(true);
        setStatus('Network Stream');
        setIsMenuOpen(false);
    };

    const toggleTool = (key: keyof typeof tools) => {
        setTools(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col group">

            {/* Top Bar (Auto-hides) */}
            <div className="absolute top-0 left-0 right-0 z-20 p-2 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
                    <span className="text-white font-medium text-xs drop-shadow-md">{status}</span>
                </div>

                {/* Tool Toggles */}
                <div className="flex gap-2">
                    <ToolToggle active={tools.horizon} onClick={() => toggleTool('horizon')} label="Hor" />
                    <ToolToggle active={tools.compass} onClick={() => toggleTool('compass')} label="Comp" />
                    <ToolToggle active={tools.vario} onClick={() => toggleTool('vario')} label="Var" />
                    <ToolToggle active={tools.altitude} onClick={() => toggleTool('altitude')} label="Alt" />
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="bg-slate-700/80 hover:bg-slate-600/80 text-white px-3 py-1 rounded text-xs backdrop-blur-sm"
                    >
                        ⚙️ Setup
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Video Feeds */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`absolute inset-0 w-full h-full object-contain ${isNetworkStream ? 'hidden' : 'block'}`}
                />

                {isNetworkStream && (
                    <img
                        src={streamUrl}
                        alt="Stream"
                        className="absolute inset-0 w-full h-full object-contain"
                        onError={() => setStatus('Stream Error')}
                    />
                )}

                {/* Overlays (Draggable & Resizable) */}
                {/* Note: We use bounds="parent" to keep them inside the video area */}

                {tools.horizon && (
                    <Rnd
                        default={{ x: 20, y: 20, width: 200, height: 200 }}
                        minWidth={100} minHeight={100}
                        bounds="parent"
                        style={{ zIndex: 10 }}
                    >
                        <HorizonWidget attitude={attitude} />
                    </Rnd>
                )}

                {tools.compass && (
                    <Rnd
                        default={{ x: 20, y: 240, width: 150, height: 150 }}
                        minWidth={100} minHeight={100}
                        bounds="parent"
                        style={{ zIndex: 10 }}
                        className="rounded-full overflow-hidden" // Round shape clipping
                    >
                        <CompassWidget yaw={attitude.yaw} />
                    </Rnd>
                )}

                {tools.vario && (
                    <Rnd
                        default={{ x: 500, y: 20, width: 150, height: 150 }}
                        minWidth={100} minHeight={100}
                        bounds="parent"
                        style={{ zIndex: 10 }}
                        className="rounded-full overflow-hidden"
                    >
                        <VarioWidget vario={vario} />
                    </Rnd>
                )}

                {tools.altitude && (
                    <Rnd
                        default={{ x: 20, y: 400, width: 300, height: 150 }}
                        minWidth={150} minHeight={100}
                        bounds="parent"
                        style={{ zIndex: 10 }}
                    >
                        <AltitudeWidget altitude={altitude} />
                    </Rnd>
                )}


                {/* Placeholder State */}
                {!isConnected && !isNetworkStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 backdrop-blur-sm z-0">
                        <svg className="w-16 h-16 mb-4 opacity-30" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8 8 8z" />
                            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4 4 4z" />
                        </svg>
                        <p>No Camera Source</p>
                    </div>
                )}
            </div>

            {/* Setup Menu */}
            {isMenuOpen && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
                    <div className="bg-slate-900/90 border border-slate-700 p-6 rounded-lg w-full max-w-sm shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold">Camera Source</h3>
                            <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 hover:text-white text-xl">&times;</button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-slate-500 text-xs uppercase font-bold mb-2">USB Camera</h4>
                                <button onClick={handleConnectUSB} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded px-3 py-2 text-sm transition">
                                    Refresh Devices
                                </button>
                                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                                    {devices.map(dev => (
                                        <button key={dev.deviceId} onClick={() => { usbCamera.connectToDevice(dev.deviceId); setIsMenuOpen(false); }} className="w-full text-left bg-slate-800 hover:bg-slate-700 text-slate-200 rounded px-3 py-2 text-xs truncate transition">
                                            {dev.label || 'Unknown Camera'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-slate-500 text-xs uppercase font-bold mb-2">Network Stream</h4>
                                <div className="flex gap-2">
                                    <input type="text" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} className="flex-1 bg-slate-950 border border-slate-700 text-white rounded px-2 py-1 text-sm focus:border-blue-500 outline-none" placeholder="http://..." />
                                    <button onClick={handleConnectStream} className="bg-green-600 hover:bg-green-500 text-white rounded px-3 py-1 text-sm transition">Go</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ToolToggle({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`px-2 py-1 rounded text-xs border backdrop-blur-sm transition-colors ${active ? 'bg-blue-600/80 border-blue-500 text-white' : 'bg-slate-800/60 border-slate-600 text-slate-400 hover:text-white'}`}
        >
            {label}
        </button>
    );
}
