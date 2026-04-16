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
const Polyline = dynamic(async () => (await import("react-leaflet")).Polyline, {
  ssr: false,
});

const COLLEGE_LOCATION = [15.3683, 75.1231]; // KLE Tech College, Hubli

export default function LeafletBusMap({ buses, studentLocation }) {
  const [L, setL] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setL(require("leaflet"));
      setIsMounted(true);
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
    return COLLEGE_LOCATION;
  }, [buses, studentLocation]);

  if (!isMounted || !center || !L) {
    return (
      <div className="h-[460px] rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex items-center justify-center text-sm font-semibold text-slate-400">
        <div className="animate-pulse flex flex-col items-center gap-3">
           <div className="w-8 h-8 rounded-full border-2 border-t-emerald-500 animate-spin" />
           Initializing Secure Live Map...
        </div>
      </div>
    );
  }

  // Double check that we have a valid center before rendering Leaflet
  if (!center[0] || !center[1]) return null;

  const studentIcon = L.divIcon({
    html: `<div style="font-size: 20px; background: rgba(16,185,129,0.3); backdrop-filter: blur(4px); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #10b981; box-shadow: 0 0 20px rgba(16,185,129,0.6);">🧍</div>`,
    className: "custom-emoji-marker",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

  const getBusIcon = (status) => {
    const isOffline = status === "offline";
    const color = isOffline ? "#64748b" : "#8b5cf6";
    return L.divIcon({
      html: `<div style="font-size: 20px; background: ${isOffline ? 'rgba(100,116,139,0.3)' : 'rgba(139,92,246,0.3)'}; backdrop-filter: blur(4px); width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid ${color}; box-shadow: 0 0 20px ${isOffline ? 'rgba(100,116,139,0.5)' : 'rgba(139,92,246,0.8)'}; transition: all 0.3s ease;">🚌</div>`,
      className: "custom-emoji-marker",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  };

  const getEffectiveCoords = (bus) => {
    if (bus?.coordinates?.lat && bus?.coordinates?.lng && 
        !(Number(bus.coordinates.lat) === 0 && Number(bus.coordinates.lng) === 0)) {
      return [bus.coordinates.lat, bus.coordinates.lng];
    }
    return COLLEGE_LOCATION;
  };

  return (
    <div className="h-[460px] relative overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: #0f172a !important;
          color: #f8fafc !important;
          border-radius: 16px !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid #1e293b !important;
          padding: 4px !important;
        }
        .leaflet-popup-tip {
          background: #0f172a !important;
          border-top: 1px solid #1e293b;
          border-left: 1px solid #1e293b;
        }
        .leaflet-container {
          background: #020617 !important;
          font-family: inherit !important;
          /* Use standard OSM but invert it smartly to keep roads visible but dark! */
          filter: invert(90%) hue-rotate(180deg) brightness(1.1) grayscale(0.2);
        }
        /* Un-invert our custom markers and popups so they keep their vibrant colors! */
        .leaflet-marker-icon, .leaflet-popup, .leaflet-control {
          filter: invert(110%) hue-rotate(180deg) brightness(0.9) grayscale(0);
        }
        .leaflet-control-zoom a {
          background-color: #1e293b !important;
          color: #94a3b8 !important;
          border: 1px solid #334155 !important;
        }
        .custom-emoji-marker {
          background: transparent;
          border: none;
        }
      `}</style>
      <MapContainer center={center} zoom={14} className="h-full w-full">
        {/* Switched back to bright OpenStreetMap but heavily filtered to perfectly visible dark mode! */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

        {buses.map((bus) => {
          const coords = getEffectiveCoords(bus);
          return (
            <Marker
              key={bus.busId}
              position={coords}
              icon={getBusIcon(bus.status)}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <div className="flex items-center gap-2 mb-3">
                    <strong className="text-xl font-black text-white">{bus.busId}</strong>
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                        {bus.status === 'offline' ? 'Idle at Campus' : bus.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium mb-2">{bus.routeName || "Assigned Route"}</div>
                  <div className="border-t border-slate-800 mt-3 pt-3 grid grid-cols-2 gap-3">
                    <div>
                        <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Status</div>
                        <div className="text-xs text-slate-200 font-bold truncate pr-2">{bus.status === 'offline' ? 'Parked' : (bus.nextStop || 'Running')}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-1">Live ETA</div>
                        <div className="text-sm font-black text-indigo-400">
                          {bus.status === 'offline' ? '--' : `~${bus.etaMinutes || 1}m`}
                        </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Draw a solid glowing real-world route connection from Student to the Bus */}
        {studentLocation && buses.length > 0 && (
           buses.map(bus => {
              const busCoords = getEffectiveCoords(bus);
              // Only draw route if bus is NOT idle at campus (avoid clutter if student is also at campus or bus is not active)
              if (bus.status === 'offline') return null;
              
              return (
                <RoutePath 
                    key={`route-${bus.busId}`}
                    start={busCoords} 
                    end={[studentLocation.lat, studentLocation.lng]} 
                />
              );
           })
        )}
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

// Sub-component to fetch and render actual Street Route using OSRM
function RoutePath({ start, end }) {
  const [routePositions, setRoutePositions] = useState([]);

  useEffect(() => {
    if (!start || !end) return;
    
    // OSRM expects coordinates in lng,lat
    const startStr = `${start[1]},${start[0]}`;
    const endStr = `${end[1]},${end[0]}`;
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startStr};${endStr}?overview=full&geometries=geojson`;

    fetch(osrmUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
           // OSRM returns GeoJSON array of [lng, lat]. Leaflet needs [lat, lng].
           const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
           setRoutePositions(coords);
        } else {
           // Fallback to straight line
           setRoutePositions([start, end]);
        }
      })
      .catch((err) => {
        console.error("OSRM Route Error:", err);
        setRoutePositions([start, end]); // Fallback
      });
  }, [start, end]);

  if (routePositions.length === 0) return null;

  return (
    <>
      {/* Glow effect outline */}
      <Polyline 
        positions={routePositions} 
        pathOptions={{ color: "rgba(16,185,129,0.3)", weight: 12, className: 'glow-line' }} 
      />
      {/* Solid inner core */}
      <Polyline 
        positions={routePositions} 
        pathOptions={{ color: "#10b981", weight: 4 }} 
      />
    </>
  );
}
