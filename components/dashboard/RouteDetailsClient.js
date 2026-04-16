"use client";

import { useEffect, useState } from "react";

export default function RouteDetailsClient({ routeId }) {
  const [route, setRoute] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        const response = await fetch(`/api/routes/${routeId}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load route");
        }
        const payload = await response.json();
        if (!mounted) return;
        setRoute(payload.route);
        setError("");
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message);
      }
    };

    refresh();
    return () => {
      mounted = false;
    };
  }, [routeId]);

  if (error) {
    return (
      <div className="panel p-8 text-center border-red-500/20 bg-red-500/5 animate-in">
         <span className="text-3xl mb-4 block">⚠️</span>
         <p className="text-red-400 font-bold">{error}</p>
         <p className="text-xs text-[var(--text-muted)] mt-2">The requested route could not be synchronized.</p>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel lg:col-span-2 h-96 skeleton bg-opacity-10" />
        <div className="panel h-96 skeleton bg-opacity-10" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3 animate-in">
      <section className="panel lg:col-span-2">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border-subtle)] pb-4">
           <div>
              <h2 className="panel-title text-xl">{route.name}</h2>
              <p className="panel-subtitle">Sequential stop analysis</p>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-tighter">Status:</span>
              <span className="tag tag-blue">Optimized</span>
           </div>
        </div>

        <div className="space-y-0 relative pl-4">
          <div className="absolute left-[29px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500/40 via-purple-500/40 to-cyan-500/40"></div>
          {route.stops.map((stop, idx) => (
            <div className="stop-row mb-4 border-none bg-transparent hover:bg-white/5 transition-all group" key={stop.stopId || stop.name}>
              <div className="flex items-center gap-4 w-full">
                 <div className="relative z-10 w-8 h-8 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--text-brand)] flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    {idx + 1}
                 </div>
                 <div className="flex-1">
                    <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--text-brand)] transition-colors">{stop.name}</span>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">Campus Waypoint</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] uppercase text-[var(--text-muted)] font-bold mb-0.5">Scheduled</div>
                    <strong className="text-sm text-[var(--text-brand)] font-black">
                       {stop.etaMinutes ? `~${stop.etaMinutes} min` : "--"}
                    </strong>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title flex items-center gap-2 mb-6">
           <div className="section-icon section-icon-cyan text-sm">📡</div>
           Assigned Fleet
        </h2>
        <div className="space-y-4">
          {route.buses.length ? (
            route.buses.map((bus) => (
              <div className="bus-card border-[var(--border-default)] shadow-lg" key={bus._id || bus.busId}>
                 <div className="flex items-center justify-between mb-3">
                    <strong className="text-lg text-[var(--text-primary)]">{bus.busId}</strong>
                    <span className={bus.status === "offline" ? "tag tag-red" : "tag tag-blue"}>
                      {bus.status}
                    </span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="live-dot"></span>
                    <span>Broadcasting live signal</span>
                 </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-[var(--border-subtle)] rounded-xl opacity-60">
               <span className="text-xl mb-2">🚦</span>
               <p className="text-sm text-[var(--text-muted)]">No active units on this route.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
