"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import { 
  MapPinned, ArrowRight, Bot, Navigation2, Scan, 
  Route as RouteIcon, User, LogOut, ShieldCheck, 
  Bell, AlertTriangle, Map as MapIcon, Clock,
  BusFront, MapPin, Timer, Activity, ChevronRight, 
  ChevronLeft, Info, Zap, Smartphone, Users,
  CheckCircle2, Loader2, Save
} from "lucide-react";
import LeafletBusMap from "@/components/LeafletBusMap";
import DelayPredictionCard from "@/components/DelayPredictionCard";
import { cn } from "@/lib/utils/cn";

function toRad(value) { return (value * Math.PI) / 180; }

function calculateETA(from, to, avgSpeedKmh = 30) {
  if (!from || !to) return null;
  const earthRadiusKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const hav = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const distanceKm = earthRadiusKm * (2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav)));
  return Math.max(1, Math.round((distanceKm / Math.max(1, avgSpeedKmh)) * 60));
}

function hasValidCoordinates(point) {
  return Number.isFinite(point?.lat) && Number.isFinite(point?.lng) && !(Number(point?.lat) === 0 && Number(point?.lng) === 0);
}

function hashText(value) {
  const text = `${value || ""}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Request failed`);
  return response.json();
}

export default function DashboardClient({ session }) {
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [studentLocation, setStudentLocation] = useState(null);
  const [error, setError] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    let active = true;
    let socket = null;

    const bootstrap = async () => {
      try {
        await loadJson("/api/socketio");
        const [profilePayload, routesPayload, busesPayload, notePayload, tripPayload] = await Promise.all([
          loadJson("/api/user/profile"),
          loadJson("/api/routes"),
          loadJson("/api/buses"),
          loadJson("/api/notifications"),
          loadJson("/api/user/trip"),
        ]);
        if (!active) return;
        const userProfile = profilePayload?.user || null;
        if (userProfile && tripPayload?.activeTrip) {
          userProfile.studentProfile = userProfile.studentProfile || {};
          userProfile.studentProfile.activeTrip = tripPayload.activeTrip;
        }
        setProfile(userProfile);
        setRoutes(routesPayload?.routes || []);
        setBuses(busesPayload?.buses || []);
        setUpdatedAt(busesPayload?.updatedAt || "");
        setNotifications(notePayload?.notifications || []);

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";
        socket = io(socketUrl, { transports: ["websocket", "polling"] });
        socket.on("bus:moved", (payload) => {
          setBuses(prev => prev.map(bus => bus.busId === payload.busId ? { ...bus, ...payload, coordinates: { lat: payload.lat, lng: payload.lng } } : bus));
          setUpdatedAt(new Date().toISOString());
        });
      } catch (err) { if (active) setError(err.message); }
    };
    bootstrap();

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { if (active) setStudentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        () => { if (active) setStudentLocation(null); },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    }
    return () => { active = false; if (socket) socket.disconnect(); };
  }, []);

  const handlePanic = async () => {
    if (!assignedBusWithEta) return;
    if (!confirm("🚨 SOS EMERGENCY: Trigger Global Panic Alert?")) return;
    try {
      await fetch("/api/safety/panic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId: assignedBusWithEta.busId, triggeredBy: "student", userEmail: profile?.email }),
      });
      alert("SOS_SENT_SUCCESS");
    } catch (err) { console.error(err); }
  };

  const myRoute = useMemo(() => routes.find(r => String(r._id) === String(profile?.studentProfile?.preferredRouteId?._id || profile?.studentProfile?.preferredRouteId)) || null, [routes, profile]);
  const myRouteStops = useMemo(() => [...(myRoute?.stops || [])].sort((a,b) => a.order - b.order), [myRoute]);
  const boardingStop = useMemo(() => myRouteStops.find(s => s.name === profile?.studentProfile?.boardingStop) || null, [myRouteStops, profile]);
  const myRouteBuses = useMemo(() => buses.filter(b => String(b.routeId) === String(myRoute?._id)), [buses, myRoute]);
  const assignedBus = useMemo(() => {
    if (!myRouteBuses.length) return null;
    return myRouteBuses[hashText(profile?._id || "") % myRouteBuses.length] || null;
  }, [myRouteBuses, profile]);

  const assignedBusWithEta = useMemo(() => {
    if (!assignedBus) return null;
    const canCalculate = assignedBus.status === "active" && boardingStop && hasValidCoordinates(assignedBus.coordinates) && hasValidCoordinates(boardingStop);
    return { ...assignedBus, etaToBoardingStop: canCalculate ? calculateETA(assignedBus.coordinates, { lat: boardingStop.lat, lng: boardingStop.lng }) : null };
  }, [assignedBus, boardingStop]);

  const isActiveTrip = profile?.role !== "student" || !!profile?.studentProfile?.activeTrip;

  return (
    <div className="min-h-screen w-full bg-[#dee2e6] text-slate-800 font-sans overflow-x-hidden relative">
      
      {/* Structural Headers (Top Nav) */}
      <header className="max-w-[1500px] mx-auto px-10 h-24 flex justify-between items-center animate-[fadeIn_0.6s_ease-out] relative z-20">
         <Link href="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all">
              <Bot className="text-emerald-500" size={28} />
            </div>
            <div>
               <h1 className="text-2xl font-black tracking-tighter text-slate-900 leading-none">SmartTransit</h1>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Strategic Fleet Control</p>
            </div>
         </Link>

         <nav className="hidden md:flex items-center gap-10">
            <NavItem label="Dashboard" href="/studenthome" />
            <NavItem label="Route Hub" href="/route" />
            <NavItem label="AI Console" href="/chat" />
            <NavItem label="Profile" href="/profile" />
            <Link href="/profile" className="flex items-center gap-3 bg-[#cbd5e0] border-2 border-slate-400/50 pl-5 pr-2 py-2 rounded-full hover:border-slate-600 transition-all group shadow-sm">
               <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Profile Node</span>
               <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-emerald-500 font-black border-2 border-emerald-500/20 overflow-hidden shadow-inner">
                 {profile?.image ? <img src={profile.image} alt="" className="w-full h-full object-cover" /> : (profile?.name?.[0] || "U")}
               </div>
            </Link>
         </nav>
      </header>

      {/* Main Workspace Grid */}
      <div className="max-w-[1500px] mx-auto px-10 pb-20 mt-2">
         
         {!isActiveTrip && profile?.role === "student" ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center animate-[slideUp_0.6s_ease-out]">
               <div className="w-24 h-24 bg-[#cbd5e0] border-4 border-slate-400 rounded-full flex items-center justify-center mb-8 shadow-inner">
                  <MapPinned className="text-slate-500" size={48} />
               </div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Tracking Link Severed</h2>
               <p className="text-slate-500 font-bold mb-10 max-w-sm mx-auto leading-relaxed text-sm uppercase tracking-widest">Awaiting active transit synchronization...</p>
               <Link href="/route" className="bg-slate-900 text-emerald-500 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all">
                  Synchronize Path
               </Link>
            </div>
         ) : (
            <div className="grid lg:grid-cols-12 gap-10 items-stretch">
               
               {/* LEFT DASH PANEL (35%) */}
               <aside className="lg:col-span-4 space-y-8 animate-[slideRight_0.6s_ease-out]">
                  <div className="bg-[#cbd5e0] border-4 border-slate-400 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden flex flex-col h-full">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-2">
                        <Activity size={14} className="text-emerald-600" /> Operational Telemetry
                     </p>

                     <div className="space-y-8 flex-1">
                        {/* Unit Identity */}
                        <div className="bg-[#dee2e6] p-6 rounded-3xl border-2 border-slate-400 shadow-inner group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-emerald-500">
                                 <BusFront size={24} />
                              </div>
                              <div className="text-right">
                                 <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-700 px-2 py-1 rounded">NODE_ACTIVE</span>
                              </div>
                           </div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Assigned Unit</p>
                           <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2 uppercase">{assignedBusWithEta?.busId || "DISCOVERING..."}</h3>
                           <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">{myRoute?.name || "Initializing Link"}</p>
                        </div>

                        {/* Core Metrics */}
                        <div className="grid grid-cols-2 gap-6">
                           <MetricItem 
                              label="Hub ETA" 
                              value={assignedBusWithEta?.etaToBoardingStop ? `${assignedBusWithEta.etaToBoardingStop} MIN` : "--"} 
                              icon={<Timer size={16}/>}
                              highlight
                           />
                           <MetricItem 
                              label="Occupancy" 
                              value={`${assignedBusWithEta?.seatsOccupied || 0}/${assignedBusWithEta?.seatCapacity || 40}`} 
                              icon={<Users size={16}/>}
                           />
                        </div>


                        {/* Alerts Box */}
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Bell size={14} /> System Node Alerts
                           </p>
                           <div className="space-y-3">
                              {notifications.slice(0, 2).map(n => (
                                <div key={n._id} className="bg-[#dee2e6] border border-slate-400 p-4 rounded-2xl text-[11px] font-bold text-slate-600">
                                   {n.message}
                                </div>
                              ))}
                              {notifications.length === 0 && (
                                <div className="bg-[#dee2e6]/50 border-2 border-dashed border-slate-400 p-8 rounded-2xl text-center">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">All Systems Nominal</p>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Action Nodes */}
                     <div className="mt-10 space-y-4">
                        <Link 
                           href="/tracking/boarding" 
                           className="w-full bg-emerald-500 text-slate-900 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-emerald-400 transition-all active:scale-[0.98] border-b-8 border-emerald-700 flex items-center justify-center gap-4 group"
                        >
                           <Smartphone size={20} className="group-hover:rotate-12 transition-transform" />
                           Boarding Terminal
                        </Link>
                        <button 
                           onClick={handlePanic}
                           className="w-full bg-slate-900 text-rose-500 py-6 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl hover:bg-slate-950 transition-all active:scale-[0.98] border-b-8 border-slate-950 flex items-center justify-center gap-4 animate-[pulseShort_2s_infinite]"
                        >
                           <AlertTriangle size={20} /> SOS EMERLINK
                        </button>
                     </div>
                  </div>
               </aside>

               <main className="lg:col-span-8 space-y-8 animate-[slideLeft_0.6s_ease-out]">
                  <div className="bg-[#0b1220] border-8 border-slate-400 rounded-[3rem] h-[550px] min-h-[500px] relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                     
                     {/* Map Intergration */}
                     <div className="w-full h-full brightness-[0.8] contrast-[1.2] grayscale-[0.2]">
                        <LeafletBusMap buses={assignedBus ? [assignedBus] : []} studentLocation={studentLocation} />
                     </div>

                     {/* Glass Overlay Cards */}
                     <div className="absolute top-10 left-10 z-30 flex flex-col gap-5 max-w-[300px]">
                        <GlassBox>
                           <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500">Signal: POSITIVE</p>
                           </div>
                        </GlassBox>

                        <GlassBox>
                           <div className="space-y-4">
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Hub</p>
                                 <p className="text-lg font-black text-white leading-none underline decoration-emerald-500 decoration-4 underline-offset-4">{assignedBus?.nextStop || "Syncing..."}</p>
                              </div>
                              <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                 <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Delta Time</p>
                                    <p className="text-xl font-black text-emerald-400 leading-none">
                                      {assignedBusWithEta?.etaToBoardingStop ? `${assignedBusWithEta.etaToBoardingStop} MIN` : "CALC..."}
                                    </p>
                                 </div>
                                 <div className="bg-white/10 px-2 py-1 rounded text-[9px] font-black text-white">LIVE_FEED</div>
                              </div>
                           </div>
                        </GlassBox>
                     </div>

                     {/* Bottom Badge */}
                     <div className="absolute bottom-10 right-10 z-30">
                        <GlassBox>
                           <div className="flex items-center gap-4">
                              <div className="text-right">
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Sync</p>
                                 <p className="text-sm font-black text-slate-100 uppercase">{updatedAt ? new Date(updatedAt).toLocaleTimeString() : "--"}</p>
                              </div>
                              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                                 <Zap className="text-slate-900" size={20} />
                              </div>
                           </div>
                        </GlassBox>
                     </div>

                     <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#020617]/80 to-transparent pointer-events-none z-20"></div>
                  </div>

                  {/* Neural Delay Prediction - Relocated to Right Side Footer */}
                  <div className="bg-slate-900 border-b-8 border-slate-950 p-8 rounded-[2.5rem] shadow-2xl relative group overflow-hidden">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                              <Zap size={20} />
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Neural Link Latency</p>
                              <h4 className="text-lg font-black text-white uppercase tracking-tighter">AI Delay Prediction Engine</h4>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Sequence</p>
                           <p className="text-xs font-bold text-slate-400">0.02ms Response</p>
                        </div>
                     </div>
                     <div>
                        <DelayPredictionCard routeId={myRoute?._id} busId={assignedBus?.busId} theme="matte" />
                     </div>
                     <Navigation2 className="absolute -right-10 -bottom-10 w-40 h-40 text-white/[0.02] -rotate-12" />
                  </div>
               </main>

            </div>
         )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulseShort { 0%, 100% { transform: scale(1); } 50% { transform: scale(0.98); opacity: 0.9; } }
      `}} />
    </div>
  );
}

/* === INTERFACE HARDWARE === */

function NavItem({ label, href }) {
   return (
      <Link href={href} className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-slate-900 transition-all relative group">
         {label}
         <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-slate-900 group-hover:w-full transition-all"></span>
      </Link>
   );
}

function MetricItem({ label, value, icon, highlight }) {
   return (
      <div className="bg-[#dee2e6] border-2 border-slate-400 p-5 rounded-3xl shadow-sm hover:shadow-md transition-all group">
         <div className="flex items-center gap-2 mb-3 text-slate-500 group-hover:text-emerald-600 transition-colors">
            {icon}
            <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
         </div>
         <p className={cn("text-2xl font-black tracking-tighter leading-none", highlight ? "text-emerald-600" : "text-slate-900")}>
            {value}
         </p>
      </div>
   );
}

function GlassBox({ children }) {
   return (
      <div className="bg-[#0b1220]/70 backdrop-blur-2xl border border-white/10 p-6 rounded-[2rem] shadow-2xl ring-1 ring-white/10">
         {children}
      </div>
   );
}
