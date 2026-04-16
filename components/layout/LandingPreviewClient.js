"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LeafletBusMap from "@/components/LeafletBusMap";

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to load preview");
  return response.json();
}

export default function LandingPreviewClient() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const payload = await loadJson("/api/buses");
        if (!active) return;
        setBuses(payload.buses || []);
      } catch {
        // ignore preview failures
      }
    };
    refresh();
    const id = setInterval(refresh, 7000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <section className="panel">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--border-subtle)] pb-6 mb-6">
        <div>
          <h2 className="panel-title flex items-center gap-2">
            <span className="live-dot"></span>
            Live Tracking Preview
          </h2>
          <p className="panel-subtitle">
            Simulated buses update every few seconds. Sign in for full access.
          </p>
        </div>
        <Link className="btn btn-primary" href="/tracking">
          Open Full Dashboard
        </Link>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-inner">
          <LeafletBusMap buses={buses} />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Active Fleet</h3>
          {buses.slice(0, 4).map((bus) => (
            <div className="bus-card" key={bus._id || bus.busId}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-[var(--text-primary)]">{bus.busId || bus.number}</span>
                <span className={bus.status === "offline" ? "tag tag-red" : "tag tag-blue"}>
                  {bus.status}
                </span>
              </div>
              <div className="text-sm text-[var(--text-secondary)] mb-3">{bus.routeName}</div>
              <div className="flex items-center justify-between text-xs border-t border-[var(--border-subtle)] pt-3">
                <div>
                  <div className="text-[var(--text-muted)] mb-1">Next Stop</div>
                  <div className="font-semibold text-[var(--text-primary)]">{bus.nextStop}</div>
                </div>
                <div className="text-right">
                  <div className="text-[var(--text-muted)] mb-1">ETA</div>
                  <div className="text-[var(--text-brand)] font-bold text-sm">~{bus.eta || bus.etaMinutes || 1} min</div>
                </div>
              </div>
            </div>
          ))}
          {!buses.length ? (
            <div className="flex flex-col items-center justify-center h-40 skeleton rounded-xl bg-opacity-5">
              <span className="text-[var(--text-muted)] text-sm animate-pulse">Initializing live fleet...</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
