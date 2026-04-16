"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import LeafletBusMap from "@/components/LeafletBusMap";

function toRad(value) {
  return (value * Math.PI) / 180;
}

function calculateETA(from, to, avgSpeedKmh = 30) {
  if (!from || !to) return null;
  const earthRadiusKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const distanceKm = earthRadiusKm * (2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav)));
  return Math.max(1, Math.round((distanceKm / Math.max(1, avgSpeedKmh)) * 60));
}

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Request failed: ${url}`);
  }
  return response.json();
}

export default function DashboardClient() {
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [studentLocation, setStudentLocation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let socket = null;

    const bootstrap = async () => {
      try {
        await loadJson("/api/socketio");
        const [profilePayload, routesPayload, busesPayload, notePayload] = await Promise.all([
          loadJson("/api/user/profile"),
          loadJson("/api/routes"),
          loadJson("/api/buses"),
          loadJson("/api/notifications"),
        ]);

        if (!active) return;
        setProfile(profilePayload.user || null);
        setRoutes(routesPayload.routes || []);
        setBuses(busesPayload.buses || []);
        setUpdatedAt(busesPayload.updatedAt || "");
        setNotifications(notePayload.notifications || []);
        setError("");

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";
        socket = io(socketUrl, { transports: ["websocket", "polling"] });
        socket.on("bus:moved", (payload) => {
          setBuses((prev) =>
            prev.map((bus) =>
              bus.busId === payload.busId
                ? {
                    ...bus,
                    coordinates: { lat: payload.lat, lng: payload.lng },
                    eta: payload.eta,
                    currentStop: payload.currentStop,
                    nextStop: payload.nextStop,
                    seatsOccupied: payload.seatsOccupied,
                    seatCapacity: payload.seatCapacity,
                  }
                : bus
            )
          );
          setUpdatedAt(new Date().toISOString());
        });
      } catch (fetchError) {
        if (!active) return;
        setError(fetchError.message);
      }
    };

    bootstrap();

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!active) return;
          setStudentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          if (!active) return;
          setStudentLocation(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }

    return () => {
      active = false;
      if (socket) socket.disconnect();
    };
  }, []);

  const preferredRoute = profile?.studentProfile?.preferredRouteId || null;
  const preferredRouteId = preferredRoute?._id || preferredRoute;
  const myRoute = routes.find((route) => String(route._id) === String(preferredRouteId)) || null;
  const myRouteStops = [...(myRoute?.stops || [])].sort((a, b) => a.order - b.order);
  const myRouteBuses = buses.filter((bus) => String(bus.routeId) === String(myRoute?._id));
  const otherRoutes = routes.filter((route) => String(route._id) !== String(myRoute?._id));

  const myRouteBusesWithEta = myRouteBuses.map((bus) => {
    const boardingStop = myRouteStops.find((stop) => stop.name === profile?.studentProfile?.boardingStop);
    return {
      ...bus,
      etaToBoardingStop: boardingStop
        ? calculateETA(bus.coordinates, { lat: boardingStop.lat, lng: boardingStop.lng })
        : bus.eta,
    };
  });

  const activeBuses = buses.filter((bus) => bus.status === "active");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Transit Dashboard</h1>
          <p className="text-slate-500 font-medium">Monitoring {activeBuses.length} active units in real-time</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
              <span className="live-dot"></span>
              <span className="text-xs font-bold uppercase text-slate-400">System Live</span>
           </div>
           <button onClick={loadJson.bind(null, "/api/buses")} className="btn btn-secondary">
              🔄 Refresh
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sidebar: Status & Info */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          <section className="panel !p-0 overflow-hidden border-indigo-100">
            <div className="bg-indigo-600 p-5 text-white">
               <h2 className="text-lg font-bold">My Personal Route</h2>
               <p className="text-indigo-100 text-sm opacity-90">
                 {myRoute ? myRoute.name : "Not configured"}
               </p>
            </div>
            <div className="p-5">
              {myRoute ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">📍</div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Boarding At</div>
                      <div className="text-sm font-bold text-slate-800">{profile?.studentProfile?.boardingStop || "Main Gate"}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {myRouteBusesWithEta.length ? (
                      myRouteBusesWithEta.map((bus) => (
                        <div key={bus.busId} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                           <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-slate-900">{bus.busId}</span>
                             <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">ON TIME</span>
                           </div>
                           <div className="text-xs text-slate-500 mb-3">Next: {bus.nextStop}</div>
                           <div className="flex items-center gap-2 justify-between">
                              <div className="text-xl font-black text-indigo-600">~{bus.etaToBoardingStop || 1} <span className="text-xs font-normal text-slate-400">min</span></div>
                              <Link href="/chat" className="text-[10px] font-bold text-indigo-500 hover:underline">ETA Details →</Link>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-sm text-slate-400">No buses on this route right now.</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-4 text-center">
                   <Link href="/profile" className="btn btn-primary w-full">Set Up My Route</Link>
                </div>
              )}
            </div>
          </section>

          <section className="panel !p-0 overflow-hidden">
             <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">Alerts & Notifications</h3>
                <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">{notifications.length} NEW</span>
             </div>
             <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                {notifications.length ? (
                  notifications.map((note) => (
                    <div className="alert-card !p-3 !pl-8" key={note._id}>
                      {note.message}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">No critical alerts.</p>
                )}
             </div>
          </section>
        </aside>

        {/* Right Main: Live Tracking Map */}
        <main className="lg:col-span-8 flex flex-col gap-6">
          <section className="panel !p-0 shadow-lg border-slate-200 ring-4 ring-slate-50/50">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  <h2 className="font-bold text-slate-800 uppercase tracking-tight">Live Fleet Radar</h2>
               </div>
               <div className="text-[10px] font-bold text-slate-400 uppercase">Updated: {updatedAt ? new Date(updatedAt).toLocaleTimeString() : "Scanning..."}</div>
            </div>
            <div className="bg-slate-50 p-1">
              <LeafletBusMap buses={activeBuses.length ? activeBuses : buses} studentLocation={studentLocation} />
            </div>
          </section>

          <details className="panel">
            <summary className="font-bold text-slate-800 cursor-pointer flex items-center gap-2">
               <span>📋 Explore Other College Routes</span>
            </summary>
            <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2">
              {otherRoutes.map((route) => {
                const routeBuses = buses.filter((bus) => String(bus.routeId) === String(route._id));
                return (
                  <div key={route._id} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md transition-all">
                    <p className="font-bold text-slate-900">{route.name}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                       {(route.stops || []).slice(0, 3).map((stop, i) => (
                         <span key={i} className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100">{stop.name}</span>
                       ))}
                       {(route.stops || []).length > 3 && <span className="text-[9px] text-slate-400">+{route.stops.length - 3} more</span>}
                    </div>
                    <p className="text-[10px] font-bold text-indigo-500 mt-3">
                      Buses: {routeBuses.length ? routeBuses.map((bus) => bus.busId).join(", ") : "None active"}
                    </p>
                  </div>
                );
              })}
            </div>
          </details>
        </main>
      </div>
    </div>
  );
}
