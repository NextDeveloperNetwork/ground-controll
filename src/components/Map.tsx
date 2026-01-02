'use client';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GPSData } from '../types';

// Fix Leaflet icons
/* eslint-disable @typescript-eslint/no-explicit-any */
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}

interface MapProps {
    gps: GPSData;
    homePosition: { lat: number; lon: number } | null;
    flightPath: [number, number][];
}

// Fixed: Invalidate size when container changes
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        if (center[0] !== 0 && center[1] !== 0) {
            map.setView(center);
        }
    }, [center, map]);

    // Force map to recalculate its container size periodically or on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

function AircraftMarker({ position, heading }: { position: [number, number], heading: number }) {
    const icon = new L.DivIcon({
        className: 'aircraft-marker-container',
        html: `<div style="transform: rotate(${heading}deg); transition: transform 0.2s ease-out;">
            <svg width="32" height="32" viewBox="0 0 32 32" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))">
                <path d="M16 2L14 10L8 12L14 14L16 22L18 14L24 12L18 10L16 2Z" 
                      fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
            </svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });

    return <Marker position={position} icon={icon} />;
}

const HomeIcon = new L.DivIcon({
    className: 'home-marker',
    html: `<svg width="24" height="24" viewBox="0 0 24 24" filter="drop-shadow(0px 1px 1px rgba(0,0,0,0.5))">
        <path d="M12 2L2 12h3v8h6v-6h2v6h6v-8h3L12 2z" 
              fill="#10b981" stroke="#ffffff" stroke-width="2"/>
    </svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

export default function Map({ gps, homePosition, flightPath }: MapProps) {
    const position: [number, number] = [gps.lat || 0, gps.lon || 0];
    const initialCenter: [number, number] = (position[0] !== 0 && position[1] !== 0) ? position : [51.505, -0.09];

    return (
        <div className="w-full h-full relative">
            <MapContainer
                center={initialCenter}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                scrollWheelZoom={true}
            >
                <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Satellite">
                        <TileLayer
                            attribution='Tiles &copy; Esri'
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="OpenStreetMap">
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Terrain">
                        <TileLayer
                            attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
                            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                        />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="Dark Matter">
                        <TileLayer
                            attribution='&copy; CartoDB'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {(position[0] !== 0 || position[1] !== 0) && (
                    <>
                        <AircraftMarker position={position} heading={gps.heading || 0} />
                        <MapController center={position} />
                    </>
                )}

                {homePosition && (
                    <Marker position={[homePosition.lat, homePosition.lon]} icon={HomeIcon} />
                )}

                <Polyline positions={flightPath} color="#3b82f6" weight={3} opacity={0.7} />
            </MapContainer>
        </div>
    );
}
