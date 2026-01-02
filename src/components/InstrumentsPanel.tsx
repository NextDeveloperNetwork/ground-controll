'use client';
import { useEffect, useRef, useState } from 'react';
import { FlightInstruments } from '../lib/instruments';
import { AttitudeData, VarioData } from '../types';

interface InstrumentsPanelProps {
    attitude: AttitudeData;
    altitude: number;
    vario: VarioData;
}

export default function InstrumentsPanel({ attitude, altitude, vario }: InstrumentsPanelProps) {
    const horizonRef = useRef<HTMLCanvasElement>(null);
    const compassRef = useRef<HTMLCanvasElement>(null);
    const varioRef = useRef<HTMLCanvasElement>(null);
    const altitudeRef = useRef<HTMLCanvasElement>(null);
    const [instruments] = useState(() => new FlightInstruments());

    useEffect(() => {
        if (horizonRef.current && compassRef.current && varioRef.current && altitudeRef.current) {
            instruments.init(
                horizonRef.current,
                compassRef.current,
                varioRef.current,
                altitudeRef.current
            );
        }

        return () => {
            instruments.destroy();
        };
    }, [instruments]);

    useEffect(() => {
        instruments.updateAttitude(attitude.pitch, attitude.roll, attitude.yaw);
    }, [attitude, instruments]);

    useEffect(() => {
        instruments.updateVerticalSpeed(vario.verticalSpeed);
    }, [vario, instruments]);

    useEffect(() => {
        instruments.updateAltitude(altitude);
    }, [altitude, instruments]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-xl shadow-lg border border-slate-700">
            <div className="flex flex-col items-center">
                <canvas
                    ref={horizonRef}
                    width={200}
                    height={200}
                    className="w-full max-w-[200px] h-auto rounded-full bg-slate-950 border-2 border-slate-600"
                />
                <span className="mt-2 text-slate-400 text-sm font-medium">Horizon</span>
            </div>
            <div className="flex flex-col items-center">
                <canvas
                    ref={compassRef}
                    width={200}
                    height={200}
                    className="w-full max-w-[200px] h-auto rounded-full bg-slate-950 border-2 border-slate-600"
                />
                <span className="mt-2 text-slate-400 text-sm font-medium">Compass</span>
            </div>
            <div className="flex flex-col items-center">
                <canvas
                    ref={varioRef}
                    width={200}
                    height={200}
                    className="w-full max-w-[200px] h-auto rounded-full bg-slate-950 border-2 border-slate-600"
                />
                <span className="mt-2 text-slate-400 text-sm font-medium">Variometer</span>
            </div>
            <div className="flex flex-col items-center">
                <canvas
                    ref={altitudeRef}
                    width={200}
                    height={200}
                    className="w-full max-w-[200px] h-auto rounded-lg bg-slate-950 border-2 border-slate-600"
                />
                <span className="mt-2 text-slate-400 text-sm font-medium">Altitude</span>
            </div>
        </div>
    );
}
