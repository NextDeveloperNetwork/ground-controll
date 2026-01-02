"use client";

import React, { useEffect, useRef } from "react";
import { FlightInstruments } from "../lib/instruments";
import { AttitudeData, VarioData } from "../types";

// Widget Components for individual reuse
export const HorizonWidget = ({
    attitude,
    size = 200,
}: {
    attitude: AttitudeData;
    size?: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instRef = useRef<FlightInstruments | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            instRef.current = new FlightInstruments();
            // Only init horizon
            instRef.current.horizonCanvas = canvasRef.current;
            instRef.current.animate();
        }
        return () => {
            instRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        instRef.current?.updateAttitude(
            attitude.pitch,
            attitude.roll,
            attitude.yaw
        );
    }, [attitude]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="w-full h-full rounded-full bg-slate-950/80 border border-slate-600/50 backdrop-blur-sm shadow-xl"
        />
    );
};

export const CompassWidget = ({
    yaw,
    size = 200,
}: {
    yaw: number;
    size?: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instRef = useRef<FlightInstruments | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            instRef.current = new FlightInstruments();
            instRef.current.compassCanvas = canvasRef.current;
            instRef.current.animate();
        }
        return () => {
            instRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        instRef.current?.updateAttitude(0, 0, yaw);
    }, [yaw]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="w-full h-full rounded-full bg-slate-950/80 border border-slate-600/50 backdrop-blur-sm shadow-xl"
        />
    );
};

export const VarioWidget = ({
    vario,
    size = 200,
}: {
    vario: VarioData;
    size?: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instRef = useRef<FlightInstruments | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            instRef.current = new FlightInstruments();
            instRef.current.varioCanvas = canvasRef.current;
            instRef.current.animate();
        }
        return () => {
            instRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        instRef.current?.updateVerticalSpeed(vario.verticalSpeed);
    }, [vario]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="w-full h-full rounded-full bg-slate-950/80 border border-slate-600/50 backdrop-blur-sm shadow-xl"
        />
    );
};

export const AltitudeWidget = ({
    altitude,
    size = 200,
}: {
    altitude: number;
    size?: number;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const instRef = useRef<FlightInstruments | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            instRef.current = new FlightInstruments();
            instRef.current.altitudeCanvas = canvasRef.current;
            instRef.current.animate();
        }
        return () => {
            instRef.current?.destroy();
        };
    }, []);

    useEffect(() => {
        instRef.current?.updateAltitude(altitude);
    }, [altitude]);

    return (
        <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="w-full h-full rounded-lg bg-slate-950/80 border border-slate-600/50 backdrop-blur-sm shadow-xl"
        />
    );
};
