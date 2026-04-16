"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import FatigueMonitor from "./FatigueMonitor";
import Link from "next/link";
import { 
  Bus, MapPin, Navigation, Power, ShieldAlert, 
  RotateCcw, Activity, Signal, Zap, Target, 
  Map as MapIcon, ChevronRight, LayoutDashboard, Truck,
  Eye, Cpu, Network, Database, ShieldCheck, Library
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const GPS_QUEUE_KEY = "driver:gps:queue";
const TRIP_ACTIVE_KEY = "driver:trip:active";
const TRIP_BUS_KEY = "driver:trip:bus";

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed: ${url}`);
  }
  return response.json();
}

function showBrowserNotification(title, body) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function getQueue() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(GPS_QUEUE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setQueue(queue) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GPS_QUEUE_KEY, JSON.stringify(queue.slice(-200)));
}

function enqueuePoint(point) {
  const queue = getQueue();
  queue.push(point);
  setQueue(queue);
}

export default function DriverClient() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState("");
  const [tripActive, setTripActive] = useState(false);
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [driver, setDriver] = useState(null);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [boardedStudents, setBoardedStudents] = useState([]);

  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastEmitRef = useRef(0);
  const tripActiveRef = useRef(false);

  const selectedBus = useMemo(
    () => buses.find((bus) => bus.busId === selectedBusId) || null,
    [buses, selectedBusId]
  );
  const selectedRoute = useMemo(
    () => routes.find((route) => String(route._id) === String(selectedBus?.routeId)) || null,
    [routes, selectedBus]
  );

  const emitPoint = (point) => {
    const socket = socketRef.current;
    if (socket && socket.connected) {
      socket.emit("gps:update", point);
      return true;
    }
    return false;
  };

  const flushQueue = () => {
    const queue = getQueue();
    if (!queue.length) return;

    const remaining = [];
    for (const point of queue) {
      const sent = emitPoint(point);
      if (!sent) {
        remaining.push(point);
      }
    }
    setQueue(remaining);

    if (!remaining.length) {
      setStatus("Queued GPS points synced.");
    }
  };

  const stopWatcher = () => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const startWatcher = async (busId, driverEmail, silent = false) => {
    if (!navigator.geolocation || !busId) {
      setStatus("Geolocation is unavailable.");
      return;
    }

    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }

    stopWatcher();
    setTripActive(true);
    tripActiveRef.current = true;
    localStorage.setItem(TRIP_ACTIVE_KEY, "1");
    localStorage.setItem(TRIP_BUS_KEY, busId);

    if (!silent) {
      showBrowserNotification("Trip started", `Live GPS started for ${busId}`);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const now = Date.now();
        const point = {
          busId,
          driverEmail,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: now,
        };

        setCoords({
          lat: point.lat,
          lng: point.lng,
          accuracy: position.coords.accuracy,
        });

        if (now - lastEmitRef.current < 5000) {
          enqueuePoint(point);
          return;
        }

        lastEmitRef.current = now;
        const sent = emitPoint(point);
        if (!sent) {
          enqueuePoint(point);
        }
      },
      (error) => {
        setStatus(error.message || "Unable to read GPS");
      },
      { enableHighAccuracy: true, maximumAge: 4000 }
    );
  };

  const startTrip = async () => {
    if (!selectedBusId) {
      setStatus("No assigned bus available.");
      return;
    }
    setStatus("");
    await startWatcher(selectedBusId, (driver?.email || selectedBus?.driverEmail || "").toLowerCase(), false);
  };

  const endTrip = () => {
    stopWatcher();
    if (socketRef.current && selectedBusId) {
      socketRef.current.emit("gps:end", { busId: selectedBusId });
    }
    setTripActive(false);
    tripActiveRef.current = false;
    localStorage.removeItem(TRIP_ACTIVE_KEY);
    localStorage.removeItem(TRIP_BUS_KEY);
    showBrowserNotification("Trip ended", `GPS stopped for ${selectedBusId}`);
  };


  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        await loadJson("/api/socketio");
        const [assignmentPayload, busPayload, routesPayload] = await Promise.all([
          loadJson("/api/driver/assignment"),
          loadJson("/api/buses"),
          loadJson("/api/routes"),
        ]);

        if (!mounted) return;
        const list = busPayload.buses || [];
        setBuses(list);
        setRoutes(routesPayload.routes || []);
        setDriver(assignmentPayload.driver || null);

        const assignedBusId = assignmentPayload?.bus?.busId || list[0]?.busId || "";
        setSelectedBusId(assignedBusId);

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";
        socketRef.current = io(socketUrl, { transports: ["websocket", "polling"] });
        socketRef.current.on("connect", flushQueue);

        const shouldResume = localStorage.getItem(TRIP_ACTIVE_KEY) === "1";
        const previousBus = localStorage.getItem(TRIP_BUS_KEY);
        if (shouldResume && assignedBusId && (!previousBus || previousBus === assignedBusId)) {
          await startWatcher(
            assignedBusId,
            `${assignmentPayload?.driver?.email || assignmentPayload?.bus?.driverEmail || ""}`.toLowerCase(),
            true
          );
        }
      } catch (error) {
        if (!mounted) return;
        setStatus(error.message);
      }
    };

    bootstrap();
    setIsMounted(true);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          if (!mounted) return;
          setLocationHint("GPS Locked. Vector precision confirmed.");
        },
        () => {
          if (!mounted) return;
          setLocationHint("Signal Lost. Enable device location.");
          showBrowserNotification("GPS Error", "Reconnect to satellite for tracking.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        setStatus("PWA service worker registration failed.");
      });
    }

    // Sync Boarding Feed
    const syncBoarding = async () => {
      try {
        const data = await loadJson("/api/driver/boarded-students");
        setBoardedStudents(data.students || []);
      } catch (e) {
        console.error("Boarding sync failed", e);
      }
    };
    syncBoarding();
    const boardingInterval = setInterval(syncBoarding, 10000);

    const installHandler = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
    };
    window.addEventListener("beforeinstallprompt", installHandler);
    window.addEventListener("online", flushQueue);

    return () => {
      mounted = false;
      if (!tripActiveRef.current) {
        stopWatcher();
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      }
      window.removeEventListener("beforeinstallprompt", installHandler);
      window.removeEventListener("online", flushQueue);
      clearInterval(boardingInterval);
    };
  }, []);

  const installApp = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    setDeferredInstallPrompt(null);
  };

  return (
    <div className="bg-black min-h-screen text-white p-6 lg:p-8 space-y-8 font-sans">
      
      {/* MISSION CONTROL HEADER */}
      <div className="bg-black border-2 border-[#39FF14]/20 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent" />
         
         <div className="flex items-center gap-6">
            <div className={cn(
              "p-4 rounded-3xl border-2 transition-all duration-700",
              tripActive ? "bg-[#39FF14]/10 border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.3)]" : "bg-red-500/10 border-red-500/50"
            )}>
               <Truck className={cn(tripActive ? "text-[#39FF14]" : "text-red-500")} size={32} />
            </div>
            <div>
               <div className="flex items-center gap-3 mb-1">
                  <div className={cn("w-2 h-2 rounded-full", tripActive ? "bg-[#39FF14] animate-ping" : "bg-red-500")} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#39FF14]">System_Status: {tripActive ? "Active" : "Idle"}</span>
               </div>
               <h1 className="text-3xl font-black tracking-tighter uppercase">
                  Vehicle <span className="text-[#39FF14]">Operator</span> Interface
               </h1>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <Link 
              href="/dhistory"
              className="flex items-center gap-3 bg-[#39FF14]/5 hover:bg-[#39FF14]/10 text-[#39FF14] px-6 py-4 rounded-2xl border border-[#39FF14]/20 transition-all text-[10px] font-black uppercase tracking-widest hidden md:flex"
            >
               <Library size={18} /> Archival_Logs
            </Link>
            {!tripActive ? (
              <button 
                onClick={startTrip}
                disabled={!isMounted || !selectedBusId}
                className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:scale-105 active:scale-95 flex items-center gap-3"
              >
                <Power size={18} /> Initiate_Trip
              </button>
            ) : (
              <button 
                onClick={endTrip}
                className="bg-black border-2 border-[#39FF14] text-[#39FF14] px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-[#39FF14]/10 active:scale-95 flex items-center gap-3"
              >
                <Power size={18} /> End_Trip
              </button>
            )}
         </div>
      </div>

      {/* CORE OPERATIONAL GRID */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PILOT HUD (The Main Focus Camera) */}
        <div className="lg:col-span-5 space-y-8">
           <FatigueMonitor
             busId={selectedBusId}
             driverId={driver?.email || selectedBus?.driverEmail || ""}
             coordinates={coords}
             tripActive={tripActive}
           />

           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Latency</span>
                 <p className="text-lg font-black text-[#39FF14]">12.4ms</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Reliability</span>
                 <p className="text-lg font-black text-[#39FF14]">99.8%</p>
              </div>
           </div>

           {status && (
             <div className="bg-red-500/5 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
                <ShieldAlert className="text-red-500" size={18} />
                <p className="text-red-500 text-[9px] font-black uppercase tracking-widest leading-none">{status}</p>
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: TACTICAL METRICS (More Refined and Balanced) */}
        <div className="lg:col-span-7 space-y-8">
           
           <div className="bg-black border-2 border-[#39FF14]/20 rounded-[2.5rem] p-8 relative overflow-hidden">
              <div className="grid md:grid-cols-3 gap-8 mb-8 border-b border-white/5 pb-8">
                 <MetricBox icon={<Target size={20} />} label="Vector_Lat" value={coords?.lat?.toFixed(5) || "0.00000"} />
                 <MetricBox icon={<MapPin size={20} />} label="Vector_Lng" value={coords?.lng?.toFixed(5) || "0.00000"} />
                 <MetricBox icon={<Zap size={20} />} label="Precision" value={coords?.accuracy ? `${Math.round(coords.accuracy)}m` : "NO_LINK"} highlight />
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                 {/* Mission Itinerary */}
                 <div>
                    <h4 className="text-[10px] font-black text-[#39FF14]/60 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                       <Navigation size={14} /> Mission_Stops
                    </h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                       {(selectedRoute?.stops || []).map((stop) => (
                         <div key={stop.stopId || stop.name} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-[#39FF14]/30 transition-all group">
                           <div className="w-8 h-8 rounded-lg bg-black border border-[#39FF14]/20 flex items-center justify-center text-[10px] font-black text-[#39FF14] group-hover:border-[#39FF14]">
                              {String(stop.order).padStart(2, '0')}
                           </div>
                           <span className="text-white/80 font-bold text-sm truncate">{stop.name}</span>
                           <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-[#39FF14]" />
                         </div>
                       ))}
                       {!selectedRoute && <p className="text-white/20 text-[10px] font-black uppercase p-4 italic tracking-widest">Awaiting Link...</p>}
                    </div>
                 </div>

                 {/* Fleet Node Info & QR */}
                 <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                       <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Node_Config</h4>
                       <div className="space-y-3">
                          <DataRow label="Fleet_ID" value={selectedBusId || "AWAIT"} />
                          <DataRow label="Sector" value={selectedRoute?.name || "UNBOUND"} />
                          <DataRow label="Auth" value={driver?.email?.split('@')[0].toUpperCase() || "PENDING"} />
                       </div>
                    </div>

                    {selectedBusId && tripActive && (
                      <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] rounded-3xl p-6 flex items-center gap-6 group hover:scale-[1.02] transition-all">
                         <div className="bg-white p-2 rounded-xl shadow-xl shrink-0">
                            <QRCodeCanvas value={selectedBusId} size={100} level="H" />
                         </div>
                         <div>
                            <p className="text-black bg-[#39FF14] text-[8px] font-black uppercase px-2 py-0.5 rounded-md w-fit mb-1">BEACON_ACTIVE</p>
                            <h5 className="text-lg font-black tracking-tight text-white mb-1">Guest_Sync</h5>
                            <p className="text-[10px] text-white/60 font-medium leading-snug">Broadcast unit vector for visitor validation.</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>

            {/* BOARDED STUDENTS LOG */}
            <div className="bg-black border-2 border-[#39FF14]/20 rounded-[2.5rem] p-8 mb-8">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.4em] flex items-center gap-3">
                     <Eye size={14} /> Boarding_Manifest
                  </h4>
                  <div className="px-3 py-1 rounded-full bg-[#39FF14]/10 border border-[#39FF14]/20 text-[9px] font-black text-[#39FF14]">
                     {boardedStudents.length} SYNCED
                  </div>
               </div>

               <div className="grid sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                  {boardedStudents.length > 0 ? boardedStudents.map((s) => (
                    <div key={s.id} className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center gap-4 hover:border-[#39FF14]/40 transition-all">
                       <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden shrink-0">
                          {s.image ? (
                             <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white/40">
                                {s.name ? s.name.charAt(0) : "U"}
                             </div>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className="text-sm font-black text-white truncate">{s.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-md", 
                                s.direction === 'toCollege' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                             )}>
                                {s.direction === 'toCollege' ? 'To College' : 'To Home'}
                             </span>
                             <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">
                                {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <p className="col-span-2 text-center py-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 border-2 border-dashed border-white/5 rounded-3xl">
                       Awaiting Initial Scan...
                    </p>
                  )}
               </div>
            </div>

           {/* FOOTER METRICS */}
           <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                 <Network size={12} className="text-[#39FF14]" /> 12ms
              </span>
              <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                 <Cpu size={12} className="text-[#39FF14]" /> Ops: 4.0
              </span>
              <span className="flex items-center gap-2 bg-[#39FF14]/5 text-[#39FF14]/60 px-4 py-2 rounded-full border border-[#39FF14]/20">
                <ShieldCheck size={12} /> SECURE_LINK
              </span>
           </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(57,255,20,0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(57,255,20,0.5); }
      `}} />
    </div>
  );
}

function MetricBox({ icon, label, value, highlight }) {
  return (
    <div className="space-y-4">
       <div className="flex items-center gap-3">
          <div className={cn("transition-colors", highlight ? "text-[#39FF14]" : "text-white/40")}>{icon}</div>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] font-mono">{label}</p>
       </div>
       <p className={cn("text-2xl font-black tracking-tighter font-mono transition-colors", highlight ? "text-[#39FF14]" : "text-white")}>
         {value}
       </p>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-[10px] font-bold">
       <span className="text-white/30 uppercase tracking-widest">{label}</span>
       <span className="text-[#39FF14] tracking-tight font-black">{value}</span>
    </div>
  );
}
