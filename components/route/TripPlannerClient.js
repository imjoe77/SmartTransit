"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, Home, GraduationCap, CheckCircle2, Navigation2, 
  BusFront, ShieldCheck, Map, Clock, LogOut, LogIn, User, 
  Bot, Plus, History, Settings, Heart, Activity,
  ChevronRight, Timer, Route as RouteIcon, MapPinned
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function TripPlannerClient({ user, route, session }) {
  const [activeTrip, setActiveTrip] = useState(user?.studentProfile?.activeTrip || null);
  const [direction, setDirection] = useState("");
  const [boardingPoint, setBoardingPoint] = useState(user?.studentProfile?.boardingStop || "");
  const [loading, setLoading] = useState(false);
  const [timeStr, setTimeStr] = useState("00:00 AM");

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    
    // Fetch Trip + Profile for Real-Time Sync
    Promise.all([
      fetch("/api/user/trip").then(res => res.json()),
      fetch("/api/user/profile").then(res => res.json())
    ]).then(([tripData, profileData]) => {
      if (tripData.activeTrip) setActiveTrip(tripData.activeTrip);
      if (profileData.user) setProfile(profileData.user);
    }).catch(() => {});
  }, []);

  const startTripAction = async (dir, stop) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction: dir, boardingPoint: stop }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveTrip(data.activeTrip);
        setTimeout(() => { window.location.href = "/tracking"; }, 1200);
      } else {
        alert(data.error || "No active bus found.");
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToCollege = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/routes/${route?._id}`);
      const data = await res.json();
      const activeBuses = data.route?.buses?.filter(b => b.status === "active") || [];
      if (activeBuses.length === 0) alert("No active buses on this route.");
      else setDirection("toCollege");
    } catch (err) { alert("Error checking status"); }
    finally { setLoading(false); }
  };

  const endTrip = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/trip", { method: "DELETE" });
      if (res.ok) { setActiveTrip(null); setDirection(""); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-screen bg-[#dee2e6] flex overflow-hidden font-sans text-slate-800">

      {/* === DARK SIDEBAR === */}
      <div className="w-72 hidden lg:flex flex-col bg-[#1a1c23] border-r border-[#2d2f39] shrink-0 text-slate-300 shadow-2xl z-20">
        <div className="h-20 flex items-center px-8 shrink-0 border-b border-[#2d2f39]">
           <Link href="/" className="font-black text-2xl text-white flex items-center gap-3 tracking-tighter hover:opacity-80 transition-opacity">
             <div className="text-emerald-500"><Bot size={28} /></div>
             SmartTransit
           </Link>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
           <div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Operational Node</p>
             <div className="space-y-1">
                <SideItem icon={<MapPinned size={18} />} label="Live Tracking" href="/tracking" />
                <SideItem icon={<Navigation2 size={18} />} label="Dashboard" href="/" active />
                <SideItem icon={<RouteIcon size={18} />} label="AI Console" href="/chat" />
                <SideItem icon={<User size={18} />} label="My Profile" href="/profile" />
             </div>
           </div>
        </div>

        <div className="p-6 shrink-0 border-t border-[#2d2f39]">
          {session?.user ? (
            <div className="bg-[#2d2f39] border border-[#3d404d] rounded-2xl p-4 flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 border border-emerald-500/30 overflow-hidden">
                  {profile?.image ? (
                    <img src={profile.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.[0] || session.user.name?.[0] || "U"
                  )}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold text-white truncate">{profile?.name || session.user.name}</p>
                 <Link href="/api/auth/signout?callbackUrl=/" className="text-[9px] text-emerald-500 uppercase font-black hover:underline">Sign Out</Link>
               </div>
            </div>
          ) : (
             <Link href="/login" className="w-full bg-[#10b981] text-[#1a1c23] py-3 rounded-lg text-[10px] font-black uppercase text-center">Login</Link>
          )}
        </div>
      </div>

      {/* === DASHBOARD AREA === */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#dee2e6]">

        {/* Console Header */}
        <div className="h-20 flex justify-between items-center px-10 border-b border-[#cbd5e0] shrink-0 bg-[#dee2e6]/50 backdrop-blur-md z-10 w-full shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Trip Planner</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Route Management — {timeStr}</p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-[#cbd5e0] border border-slate-400/30 rounded-full text-[9px] font-black tracking-widest text-slate-600 uppercase">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> HUB_LINK ACTIVE
          </div>
        </div>

        {/* Console Scroll area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
          
          <div className="max-w-6xl mx-auto space-y-12 pb-20">
            
            {activeTrip ? (
               <section className="animate-[slideUp_0.4s_ease-out] space-y-8">
                  <div className="bg-[#cbd5e0] border-2 border-slate-400 rounded-3xl p-8 flex items-center gap-8 relative overflow-hidden group">
                     <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600 border border-emerald-500/30">
                        <Navigation2 className="animate-pulse" size={32} />
                     </div>
                     <div className="flex-1">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">Trip En Route</h2>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Travelling {activeTrip.direction} Hub on Route {route?.routeNumber}</p>
                     </div>
                     <div className="flex gap-4">
                        <Link href="/tracking" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg">Map Hub</Link>
                        <button onClick={endTrip} className="bg-slate-300 border border-slate-400 text-slate-600 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px]">Stop Seq</button>
                     </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <ConsoleStat label="Boarding Hub" value={activeTrip.boardingPoint} icon={<MapPin size={20}/>} />
                    <ConsoleStat label="Destination Node" value={activeTrip.destination} icon={<GraduationCap size={20}/>} />
                    <ConsoleStat label="Unit Hash" value={activeTrip.busId} icon={<BusFront size={20}/>} highlight />
                  </div>
               </section>
            ) : (
              <div className="space-y-12">
                
                {/* Intent Hub */}
                <section className="space-y-8">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                     <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Intent Coordination
                  </p>
                  <div className="grid md:grid-cols-2 gap-8">
                    <IntentTile 
                       onClick={handleToCollege} 
                       active={direction === "toCollege"}
                       icon={<GraduationCap size={32} />}
                       title="Inbound Transit"
                       subtitle="HOME HUB → CAMPUS"
                       next="8:45 AM"
                       duration="~22 MIN"
                       hubs={route?.stops?.length || 0}
                    />
                    <IntentTile 
                       onClick={() => startTripAction("toHome", "KLE Tech College")} 
                       active={direction === "toHome"}
                       icon={<Home size={32} />}
                       title="Outbound Transit"
                       subtitle="CAMPUS → HOME HUB"
                       next="4:30 PM"
                       duration="~25 MIN"
                       hubs={route?.stops?.length || 0}
                    />
                  </div>
                </section>

                {/* Stop Sync Grid */}
                {direction === "toCollege" && (
                   <div className="bg-[#cbd5e0] border-4 border-slate-400 rounded-[2.5rem] p-10 animate-[slideUp_0.4s_ease-out]">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Synchronization Point Selection</p>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                         {(route?.stops || []).map(stop => (
                           <button
                             key={stop.name}
                             onClick={() => { setBoardingPoint(stop.name); startTripAction("toCollege", stop.name); }}
                             className={cn(
                               "p-5 rounded-2xl border-2 text-left transition-all",
                               boardingPoint === stop.name 
                                 ? "bg-emerald-500 border-emerald-500 text-white shadow-xl" 
                                 : "bg-[#dee2e6] border-slate-400 text-slate-500 hover:border-emerald-500 hover:text-slate-900 shadow-sm"
                             )}
                           >
                             <p className="font-black text-xs leading-none">{stop.name}</p>
                           </button>
                         ))}
                      </div>
                   </div>
                )}

                {/* Operational Timeline Container */}
                <section className="bg-[#dee2e6] border-4 border-slate-400 rounded-[2.5rem] p-10 shadow-xl overflow-hidden relative">
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-3">
                     Operational Timeflow
                  </p>
                  <div className="overflow-x-auto no-scrollbar pb-4">
                     <div className="flex items-center gap-4 min-w-max">
                        <CycleLink time="7:30 AM" status="passed" />
                        <LinkDash />
                        <CycleLink time="8:45 AM" status="next" />
                        <LinkDash />
                        <CycleLink time="10:15 AM" status="pending" />
                        <LinkDash />
                        <CycleLink time="1:00 PM" status="pending" />
                        <LinkDash />
                        <CycleLink time="4:30 PM" status="pending" />
                        <LinkDash />
                        <CycleLink time="6:00 PM" status="last" />
                     </div>
                  </div>
                </section>

                {/* Sequence + Metrics */}
                <div className="grid lg:grid-cols-5 gap-10">
                   <div className="lg:col-span-3 bg-[#cbd5e0] border-4 border-slate-400 rounded-[2.5rem] p-10">
                      <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest mb-10">Hub Sync Sequence</p>
                      <div className="space-y-0">
                        {(route?.stops || []).map((stop, idx, arr) => {
                          const isUserStop = stop.name === boardingPoint || stop.name === (user?.studentProfile?.boardingStop || "");
                          const isLast = idx === arr.length - 1;
                          return (
                            <div key={stop.name} className="flex gap-6 h-16">
                               <div className="flex flex-col items-center w-6 shrink-0">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border-2 shrink-0 z-10",
                                    isUserStop ? "bg-emerald-500 border-emerald-500 ring-4 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-[#dee2e6] border-slate-500"
                                  )} />
                                  {!isLast && <div className="w-[3px] flex-1 bg-slate-400/50" />}
                               </div>
                               <p className={cn("text-base font-black pt-0.5", isUserStop ? "text-emerald-700 underline" : "text-slate-800")}>{stop.name}</p>
                            </div>
                          );
                        })}
                      </div>
                   </div>

                   <div className="lg:col-span-2 space-y-6">
                      <MetricUnit label="Active Hubs" value={route?.stops?.length || 0} icon={<MapPin size={24}/>} />
                      <MetricUnit label="Avg Sync Time" value="22 MIN" icon={<Timer size={24}/>} />
                      <MetricUnit label="Node Link Stat" value="94%" icon={<ShieldCheck size={24}/>} />
                      <div className="bg-slate-900 border-b-8 border-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-end min-h-[180px] shadow-2xl">
                         <div className="relative z-10">
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Assigned Context</p>
                           <h4 className="text-4xl font-black tracking-tighter mb-1">Unit {route?.routeNumber}</h4>
                           <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Digital Route Hub Verified</p>
                         </div>
                         <BusFront className="absolute -right-12 -top-12 w-48 h-48 opacity-[0.03] text-white rotate-12" />
                      </div>
                   </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}

/* === INTERFACE ELEMENTS === */

function SideItem({ icon, label, active, href }) {
  return (
    <Link href={href || "#"} className="w-full block group">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-bold text-sm",
        active 
          ? "bg-[#2d3436] text-white shadow-xl shadow-black/30" 
          : "text-slate-500 hover:bg-[#2d3436]/50 hover:text-slate-300"
      )}>
        <div className={cn("transition-all duration-300", active && "text-emerald-500")}>{icon}</div>
        <span className="tracking-wide">{label}</span>
      </div>
    </Link>
  );
}

function IntentTile({ onClick, active, icon, title, subtitle, next, duration, hubs }) {
  return (
    <button onClick={onClick} className={cn(
      "bg-[#cbd5e0] border-4 rounded-[2.5rem] p-10 text-left transition-all duration-300 relative overflow-hidden group hover:shadow-2xl",
      active ? "border-emerald-500 shadow-emerald-500/20" : "border-slate-400 hover:border-slate-800"
    )}>
       <div className={cn(
         "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 border-2 transition-all duration-500",
         active ? "bg-emerald-500 border-emerald-400 text-slate-900 shadow-lg" : "bg-[#dee2e6] border-slate-400 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
       )}>
          {icon}
       </div>
       <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-1">{title}</h4>
       <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-8", active ? "text-emerald-700" : "text-slate-500")}>{subtitle}</p>
       
       <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-[#dee2e6]/50 border border-slate-400/50 px-3 py-2 rounded-xl text-[10px] font-black text-slate-600 uppercase">Next: {next}</div>
          <div className="bg-emerald-500/10 text-emerald-700 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{duration}</div>
          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{hubs} HUBS</div>
       </div>
       <div className="absolute top-10 right-10 text-slate-400 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
         <ChevronRight size={32} />
       </div>
    </button>
  );
}

function CycleLink({ time, status }) {
  const meta = {
    passed: "bg-transparent border-slate-400/30 text-slate-500/50 grayscale opacity-40",
    next: "bg-emerald-500 text-slate-900 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-105",
    pending: "bg-[#cbd5e0] border-slate-400 text-slate-700",
    last: "bg-slate-900 border-slate-900 text-white"
  };
  return (
    <div className={cn("px-6 py-4 rounded-2xl border-2 flex flex-col gap-1 min-w-[140px] text-center transition-all", meta[status])}>
       <span className="text-sm font-black tracking-tighter">{time}</span>
       <span className="text-[9px] font-black uppercase tracking-widest opacity-60">HUB_SYNC</span>
    </div>
  );
}

function LinkDash() { return <div className="w-4 h-[2px] bg-slate-400/50 shrink-0" />; }

function MetricUnit({ label, value, icon }) {
  return (
    <div className="bg-[#cbd5e0] border-4 border-slate-400 rounded-3xl p-6 flex items-center justify-between group">
       <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter">{value}</p>
       </div>
       <div className="bg-[#dee2e6] border-2 border-slate-400 p-3 rounded-2xl text-slate-400 group-hover:bg-slate-950 group-hover:text-emerald-500 transition-colors shadow-inner">
          {icon}
       </div>
    </div>
  );
}

function ConsoleStat({ label, value, icon, highlight }) {
  return (
    <div className="bg-[#cbd5e0] border-2 border-slate-400 p-6 rounded-2xl flex flex-col gap-4">
       <div className="w-10 h-10 bg-[#dee2e6] border border-slate-400 rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
         {icon}
       </div>
       <div>
         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
         <p className={cn("text-lg font-black tracking-tight", highlight ? "text-emerald-600" : "text-slate-900")}>{value}</p>
       </div>
    </div>
  );
}
