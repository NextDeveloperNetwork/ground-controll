'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { Socket } from 'socket.io-client';
import { MSP } from '@/lib/msp';
import { CRSF } from '@/lib/crsf';
import { USBCamera } from '@/lib/usb-camera';
import { TelemetryData } from '@/types';
import CameraView from '@/components/CameraView';
import TelemetryPanel from '@/components/TelemetryPanel';
import { Maximize2, Minimize2, RotateCw, Menu, X, BarChart3, Layers } from 'lucide-react';

// Dynamic import for Map to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const INITIAL_TELEMETRY: TelemetryData = {
  gps: { fix: 0, numSat: 0, lat: 0, lon: 0, alt: 0, speed: 0, heading: 0 },
  attitude: { roll: 0, pitch: 0, yaw: 0 },
  battery: { voltage: 0, current: 0 },
  altitude: 0,
  vario: 0,
  rssi: 0,
  flightMode: 'DISARMED',
  armed: false

};

export default function Home() {
  // Classes
  const [msp] = useState(() => new MSP());
  const [crsf] = useState(() => new CRSF());
  const [usbCamera] = useState(() => new USBCamera());

  // State
  const [telemetry, setTelemetry] = useState<TelemetryData>(INITIAL_TELEMETRY);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'usb' | 'elrs' | 'remote'>('usb');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [homePosition, setHomePosition] = useState<{ lat: number, lon: number } | null>(null);
  const [flightPath, setFlightPath] = useState<[number, number][]>([]);

  // Layout State
  const [mainView, setMainView] = useState<'camera' | 'map'>('camera');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Refs for throttling updates
  const telemetryRef = useRef(INITIAL_TELEMETRY);

  useEffect(() => {
    // Initialize Socket.IO only on client
    let newSocket: Socket;

    import('socket.io-client').then(({ io }) => {
      newSocket = io();
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to Relay Server');
      });

      newSocket.on('telemetry_update', (data: TelemetryData) => {
        if (!msp.isConnected && !crsf.isConnected) {
          updateTelemetry(data);
          setConnectionType('remote');
          setIsConnected(true);
        }
      });
    });

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [msp.isConnected, crsf.isConnected]);

  // Setup MSP Callbacks
  useEffect(() => {
    msp.onMessage(msp.MSP_RAW_GPS, (payload) => {
      const gps = msp.parseGPS(payload);
      updateTelemetry({ gps });
    });
    msp.onMessage(msp.MSP_ATTITUDE, (payload) => {
      const attitude = msp.parseAttitude(payload);
      updateTelemetry({ attitude });
    });
    msp.onMessage(msp.MSP_ALTITUDE, (payload) => {
      const alt = msp.parseAltitude(payload);
      updateTelemetry({ altitude: alt.estimatedAltitude / 100, vario: alt.estimatedVario ? alt.estimatedVario / 100 : 0 });
    });
    msp.onMessage(msp.MSP_ANALOG, (payload) => {
      const bat = msp.parseAnalog(payload);
      updateTelemetry({ battery: bat, rssi: bat.rssi });
    });
    msp.onMessage(msp.MSP_STATUS, (payload) => {
      const status = msp.parseStatus(payload);
      updateTelemetry({
        armed: status.armed,
        flightMode: status.activeModes.length > 0 ? status.activeModes.join(', ') : (status.armed ? 'ARMED' : 'DISARMED')
      });
    });
    msp.onMessage(msp.MSP_BATTERY_STATE, (payload) => {
      const bat = msp.parseBatteryState(payload);
      updateTelemetry({ battery: bat });
    });
  }, [msp]);

  // Setup CRSF Callbacks
  useEffect(() => {
    crsf.on('gps', (gps) => updateTelemetry({ gps }));
    crsf.on('attitude', (attitude) => updateTelemetry({ attitude }));
    crsf.on('battery', (battery) => updateTelemetry({ battery }));
    crsf.on('vario', (vario) => updateTelemetry({ vario: vario.verticalSpeed }));
    crsf.on('flightMode', (mode) => updateTelemetry({ flightMode: mode }));
    crsf.on('linkStats', (stats) => updateTelemetry({ linkStats: stats, rssi: stats.uplinkRSSI1 }));
  }, [crsf]);

  // Broadcast Loop
  useEffect(() => {
    if ((msp.isConnected || crsf.isConnected) && socket) {
      const interval = setInterval(() => {
        socket.emit('telemetry_data', telemetryRef.current);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [msp.isConnected, crsf.isConnected, socket]);

  const updateTelemetry = (partial: Partial<TelemetryData>) => {
    const newState = { ...telemetryRef.current, ...partial };
    if (partial.gps) newState.gps = { ...telemetryRef.current.gps, ...partial.gps };
    if (partial.attitude) newState.attitude = { ...telemetryRef.current.attitude, ...partial.attitude };
    if (partial.battery) newState.battery = { ...telemetryRef.current.battery, ...partial.battery };

    telemetryRef.current = newState;
    setTelemetry(newState);

    if (partial.gps && partial.gps.fix && partial.gps.lat && partial.gps.lon) {
      setFlightPath(prev => [...prev, [partial.gps!.lat, partial.gps!.lon]]);
      if (!homePosition) {
        setHomePosition({ lat: partial.gps!.lat, lon: partial.gps!.lon });
      }
    }
  };

  const handleConnectUSB = async () => {
    try {
      await msp.connect();
      setIsConnected(true);
      setConnectionType('usb');
      setInterval(() => msp.requestTelemetry(), 100);
    } catch (err) {
      alert('Connection Failed: ' + err);
    }
  };

  const handleConnectELRS = async () => {
    try {
      await crsf.connect();
      setIsConnected(true);
      setConnectionType('elrs');
    } catch (err) {
      alert('ELRS Connection Failed: ' + err);
    }
  };

  const handleDisconnect = async () => {
    await msp.disconnect();
    await crsf.disconnect();
    setIsConnected(false);
    setConnectionType('usb');
  };

  const swapViews = () => {
    setMainView(prev => prev === 'camera' ? 'map' : 'camera');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden">

      {/* Header */}
      {!isFullScreen && (
        <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
              <Menu size={20} />
            </button>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hidden sm:block">
              iNav <span className="text-slate-500">GCS</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border uppercase ${isConnected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
              {isConnected ? connectionType : 'NC'}
            </div>

            <button onClick={() => setIsMetricsOpen(!isMetricsOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition lg:hidden" title="Telemetry">
              <BarChart3 size={18} />
            </button>

            <button onClick={swapViews} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition" title="Swap Views">
              <RotateCw size={18} />
            </button>

            <button onClick={toggleFullScreen} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition" title="Toggle Fullscreen">
              {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </header>
      )}

      <div className="flex flex-1 overflow-hidden relative">

        {/* Connection Sidebar */}
        <div className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
        <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-6 overflow-y-auto transition-transform duration-300 z-[101] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Menu</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Connection</h2>
            <div className="space-y-2">
              {!isConnected ? (
                <>
                  <button onClick={() => { handleConnectUSB(); setIsSidebarOpen(false); }} className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition shadow-lg shadow-blue-900/20">Connect USB</button>
                  <button onClick={() => { handleConnectELRS(); setIsSidebarOpen(false); }} className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-sm transition">Connect ELRS</button>
                </>
              ) : (
                <button onClick={handleDisconnect} className="w-full h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-medium text-sm transition">Disconnect</button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Options</h2>
            <button onClick={swapViews} className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-sm">
              <span>Swap Cam/Map</span>
              <RotateCw size={14} />
            </button>
          </div>

          <div className="mt-auto text-[10px] text-slate-600 text-center uppercase tracking-widest">Ground Station v0.3.1</div>
        </aside>

        {/* Telemetry Sidebar */}
        <div className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-300 lg:hidden ${isMetricsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMetricsOpen(false)} />
        <aside className={`fixed inset-y-0 right-0 w-72 md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col transition-transform duration-300 z-[101] ${isMetricsOpen ? 'translate-x-0' : 'translate-x-full'} lg:relative lg:translate-x-0 flex-shrink-0 lg:z-10 shadow-2xl`}>
          <div className="p-4 border-b border-slate-800 flex justify-between items-center lg:hidden">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">Telemetry</h2>
            <button onClick={() => setIsMetricsOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <TelemetryPanel data={telemetry} />
          </div>
        </aside>

        {/* Main View Area */}
        <div className="flex-1 relative bg-slate-950 p-2 md:p-3 overflow-hidden">

          <div className="h-full w-full relative">

            {/* Camera View */}
            <div className={`absolute transition-all duration-500 ease-out rounded-xl border border-slate-800 shadow-xl overflow-hidden bg-black
              ${mainView === 'camera'
                ? 'inset-0 z-20'
                : 'md:bottom-4 md:right-4 md:w-80 md:h-56 md:z-30 bottom-4 right-4 w-40 h-28 z-30 opacity-100 hover:scale-105 cursor-pointer ring-2 ring-blue-500/50'
              }
            `}
              onClick={() => mainView === 'map' && swapViews()}
            >
              <CameraView
                usbCamera={usbCamera}
                attitude={telemetry.attitude}
                altitude={telemetry.altitude}
                vario={{ verticalSpeed: telemetry.vario }}
              />
              {mainView === 'map' && (
                <div className="absolute top-1 left-2 text-[8px] font-bold text-white/50 uppercase pointer-events-none">Camera</div>
              )}
            </div>

            {/* Map View */}
            <div className={`absolute transition-all duration-500 ease-out rounded-xl border border-slate-800 shadow-xl overflow-hidden bg-slate-900
              ${mainView === 'map'
                ? 'inset-0 z-20'
                : 'md:bottom-4 md:right-4 md:w-80 md:h-56 md:z-30 bottom-4 right-4 w-40 h-28 z-30 opacity-100 hover:scale-105 cursor-pointer ring-2 ring-blue-500/50'
              }
            `}
              onClick={() => mainView === 'camera' && swapViews()}
            >
              <Map
                gps={telemetry.gps}
                homePosition={homePosition}
                flightPath={flightPath}
              />
              {mainView === 'camera' && (
                <div className="absolute top-1 left-2 text-[8px] font-bold text-white/50 uppercase pointer-events-none z-[401]">Map</div>
              )}
            </div>

            {/* Floating Fullscreen Controls */}
            {isFullScreen && (
              <div className="absolute top-4 right-4 z-40 flex gap-2">
                <button onClick={swapViews} className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur border border-white/10 shadow-2xl transition">
                  <RotateCw size={20} />
                </button>
                <button onClick={toggleFullScreen} className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur border border-white/10 shadow-2xl transition">
                  <Minimize2 size={20} />
                </button>
              </div>
            )}

            {/* Mobile Tool Indicator */}
            <div className="absolute bottom-4 left-4 z-40 pointer-events-none flex flex-col gap-1 md:hidden">
              <div className="px-2 py-0.5 bg-black/50 backdrop-blur rounded text-[10px] font-mono text-blue-400 border border-blue-500/20">
                LAT: {telemetry.gps.lat.toFixed(5)}
              </div>
              <div className="px-2 py-0.5 bg-black/50 backdrop-blur rounded text-[10px] font-mono text-blue-400 border border-blue-500/20">
                LON: {telemetry.gps.lon.toFixed(5)}
              </div>
            </div>

          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </main>
  );
}
