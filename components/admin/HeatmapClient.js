"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(async () => (await import("react-leaflet")).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import("react-leaflet")).TileLayer, { ssr: false });
const CircleMarker = dynamic(async () => (await import("react-leaflet")).CircleMarker, { ssr: false });
const Popup = dynamic(async () => (await import("react-leaflet")).Popup, { ssr: false });

export default function HeatmapClient() {
  const [stops, setStops] = useState([]);
  const [period, setPeriod] = useState("today");
  const [insights, setInsights] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/heatmap?period=${period}`)
      .then(r => r.json())
      .then(d => setStops(d.stops || []));
  }, [period]);

  const analyzeRoutes = async () => {
    setAnalyzing(true);
    setInsights([]);
    try {
      const res = await fetch("/api/admin/route-analysis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stops })
      });
      const data = await res.json();
      setInsights(data.suggestions || []);
    } finally {
      setAnalyzing(false);
    }
  };
  
  const maxBoardings = useMemo(() => Math.max(...stops.map(s => s.boardings), 1), [stops]);

  const center = stops.length > 0 ? [stops[0].lat, stops[0].lng] : [15.3647, 75.1240];

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: rgba(13, 17, 23, 0.95);
          color: #e6edf3; border-radius: 8px; border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .leaflet-popup-tip { background: rgba(13, 17, 23, 0.95); }
        .leaflet-container { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
      `}</style>
      
      <div className="lg:col-span-2 space-y-6">
        <section className="panel p-0 overflow-hidden h-[500px]">
          {stops.length > 0 && typeof window !== "undefined" && (
            <MapContainer center={center} zoom={12} className="h-full w-full">
               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               {stops.map(stop => {
                 const ratio = stop.boardings / maxBoardings;
                 const radius = 5 + (ratio * 25);
                 const opacity = 0.3 + (ratio * 0.7);
                 return (
                   <CircleMarker
                     key={stop.id}
                     center={[stop.lat, stop.lng]}
                     pathOptions={{ color: "#10b981", fillColor: "#059669", fillOpacity: opacity, weight: 1 }}
                     radius={radius}
                   >
                     <Popup>
                       <div className="p-1 min-w-[120px]">
                         <h4 className="font-bold text-white mb-1">{stop.name}</h4>
                         <p className="text-xs text-emerald-400 font-bold">{stop.boardings} boardings</p>
                         <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{stop.route}</p>
                       </div>
                     </Popup>
                   </CircleMarker>
                 );
               })}
            </MapContainer>
          )}
        </section>

        <section className="panel">
          <div className="flex items-center justify-between mb-4">
             <h2 className="panel-title flex items-center gap-2">
               <span className="text-xl">🧠</span> AI Route Optimisation
             </h2>
             <button onClick={analyzeRoutes} disabled={analyzing || !stops.length} className="btn btn-secondary py-1 text-xs">
                {analyzing ? "Analysing patterns..." : "Analyse Routes"}
             </button>
          </div>
          
          {insights.length > 0 ? (
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              {insights.map((insight, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-emerald-500 font-black">→</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          ) : (
             <p className="text-sm text-[var(--text-muted)] italic">Click analyse to run ML insights over current boarding trends.</p>
          )}
        </section>
      </div>

      <div className="space-y-6">
         <section className="panel h-full flex flex-col">
            <h2 className="panel-title mb-4">Boarding Demand</h2>
            <div className="flex bg-[var(--bg-elevated)] p-1 rounded-lg border border-[var(--border-subtle)] mb-4">
               {["today", "week", "all_time"].map((p) => (
                 <button
                   key={p}
                   className={`flex-1 text-xs py-1.5 rounded-md font-bold uppercase tracking-wider transition-colors ${period === p ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                   onClick={() => setPeriod(p)}
                 >
                   {p.replace('_', ' ')}
                 </button>
               ))}
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 max-h-[600px] scrollbar-thin">
               {stops.map(stop => {
                 const percentage = Math.round((stop.boardings / maxBoardings) * 100);
                 return (
                   <div key={stop.id} className="text-sm">
                     <div className="flex justify-between items-end mb-1 text-[var(--text-primary)]">
                       <span className="font-medium truncate pr-2" title={stop.name}>{stop.name}</span>
                       <span className="font-bold text-emerald-500">{stop.boardings}</span>
                     </div>
                     <p className="text-[10px] text-[var(--text-muted)] mb-1.5 uppercase tracking-widest">{stop.route}</p>
                     <div className="w-full bg-slate-800 rounded-full h-1.5">
                       <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                     </div>
                   </div>
                 );
               })}
            </div>
         </section>
      </div>
    </div>
  );
}
