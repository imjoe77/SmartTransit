"use client";

import dynamic from "next/dynamic";
import { useMemo, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, {
  ssr: false,
});
const Marker = dynamic(
  async () => (await import("react-leaflet")).Marker,
  { ssr: false }
);
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, {
  ssr: false,
});

export default function LeafletBusMap({ buses, studentLocation }) {
  const [L, setL] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setL(require("leaflet"));
    }
  }, []);

  const center = useMemo(() => {
    if (studentLocation) {
      return [studentLocation.lat, studentLocation.lng];
    }
    if (buses?.length) {
      const firstBus = buses.find((bus) => bus?.coordinates?.lat && bus?.coordinates?.lng);
      if (firstBus) {
        return [firstBus.coordinates.lat, firstBus.coordinates.lng];
      }
    }
    return null;
  }, [buses, studentLocation]);

  if (!center || !L) {
    return (
      <div className="h-[460px] rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-center text-sm font-semibold text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
           <div className="w-8 h-8 rounded-full border-2 border-t-emerald-500 animate-spin" />
           Initializing Secure Live Map...
        </div>
      </div>
    );
  }

  const studentIcon = L.divIcon({
    html: `<div style="font-size: 20px; background: rgba(16,185,129,0.15); backdrop-filter: blur(4px); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.4);">🧍</div>`,
    className: "custom-emoji-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

  const getBusIcon = (status) => {
    const isOffline = status === "offline";
    const color = isOffline ? "#64748b" : "#8b5cf6"; // Slate for offline, Indigo for active
    return L.divIcon({
      html: `<div style="font-size: 20px; background: ${isOffline ? 'rgba(100,116,139,0.15)' : 'rgba(139,92,246,0.15)'}; backdrop-filter: blur(4px); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${color}; box-shadow: 0 0 20px ${isOffline ? 'rgba(100,116,139,0.4)' : 'rgba(139,92,246,0.6)'}; transition: all 0.3s ease;">🚌</div>`,
      className: "custom-emoji-marker",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  };

  return (
    <div className="h-[460px] relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: #0f172a !important; /* matches slate-900 */
          color: #f8fafc !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid #1e293b !important; /* matches slate-800 */
          padding: 4px !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border-top: 1px solid #1e293b;
          border-left: 1px solid #1e293b;
        }
        .leaflet-container {
          background: #020617 !important; /* matches slate-950 */
          font-family: inherit !important;
        }
        .leaflet-control-zoom a {
          background-color: #1e293b !important;
          color: #94a3b8 !important;
          border: 1px solid #334155 !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #334155 !important;
          color: #f8fafc !important;
        }
        .custom-emoji-marker {
          background: transparent;
          border: none;
        }
      `}</style>
      <MapContainer center={center} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions" target="_blank" style="color: #94a3b8;">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" style="color: #94a3b8;">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {studentLocation ? (
          <Marker
            position={[studentLocation.lat, studentLocation.lng]}
            icon={studentIcon}
          >
            <Popup>
              <div className="text-xs font-bold text-emerald-400 px-2 py-1 uppercase tracking-widest">You are here</div>
            </Popup>
          </Marker>
        ) : null}
        {buses.map((bus) => (
          <Marker
            key={bus.busId}
            position={[bus.coordinates.lat, bus.coordinates.lng]}
            icon={getBusIcon(bus.status)}
          >
            <Popup>
              <div className="p-2 min-w-[180px]">
                <div className="flex items-center gap-2 mb-3">
                   <strong className="text-xl font-black text-white">{bus.busId}</strong>
                   <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                      {bus.status}
                   </span>
                </div>
                <div className="text-xs text-slate-400 font-medium mb-2">{bus.routeName || "Assigned Route"}</div>
                <div className="border-t border-slate-800 mt-3 pt-3 grid grid-cols-2 gap-3">
                   <div>
                      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Next Stop</div>
                      <div className="text-xs text-slate-200 font-bold truncate pr-2">{bus.nextStop}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Live ETA</div>
                      <div className="text-sm font-black text-indigo-400">~{bus.etaMinutes || 1}m</div>
                   </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <div className="absolute bottom-4 left-4 z-[1000] px-4 py-3 bg-slate-900 border border-slate-800 shadow-xl rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-4">
         <div className="flex items-center gap-2">
            <span className="text-sm">🚌</span> Active Bus
         </div>
         <div className="flex items-center gap-2">
            <span className="text-sm">🧍</span> You
         </div>
      </div>
    </div>
  );
}
