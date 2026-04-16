"use client";
import { useEffect, useMemo, useState } from "react";
import { 
  Home, User, Bus, Mail, Phone, Globe, Award, BookOpen, Star, 
  QrCode, MapPin, Clock, AlertCircle, Menu, CheckCircle2,
  Bot, MapPinned, Navigation2, Route as RouteIcon, Scan,
  LogOut, ShieldCheck, Activity, ChevronRight, Settings,
  LogOut as LogOutIcon, BusFront, CreditCard, Ticket,
  Image as ImageIcon, Loader2, Save
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    let details = "";
    try {
      const payload = await response.json();
      details = payload?.error || payload?.details || "";
    } catch {
      details = "";
    }
    throw new Error(details || `Request failed: ${url}`);
  }
  return response.json();
}

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  
  // Editable fields
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preferredRouteId, setPreferredRouteId] = useState("");
  const [boardingStop, setBoardingStop] = useState("");
  
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    let active = true;
    const bootstrap = async () => {
      try {
        const [profilePayload, routesPayload] = await Promise.all([
          loadJson("/api/user/profile"),
          loadJson("/api/routes"),
        ]);
        if (!active) return;
        const user = profilePayload?.user;
        if (!user) throw new Error("Unauthorized Access Detected");
        
        setProfile(user);
        setName(user.name || "");
        setImageUrl(user.image || "");
        setRoutes(routesPayload.routes || []);
        
        const routeValue = user?.studentProfile?.preferredRouteId?._id || user?.studentProfile?.preferredRouteId || "";
        setPreferredRouteId(String(routeValue));
        setBoardingStop(user?.studentProfile?.boardingStop || "");
      } catch (error) {
        if (active) setStatus(`BOOT_ERROR: ${error.message}`);
      } finally {
        if (active) setLoading(false);
      }
    };
    bootstrap();
    return () => { active = false; };
  }, []);

  const selectedRoute = useMemo(
    () => routes.find((route) => String(route._id) === String(preferredRouteId)) || null,
    [routes, preferredRouteId]
  );

  const save = async (event) => {
    event.preventDefault();
    setStatus("PROTOCOL_SYNCING...");
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: imageUrl, preferredRouteId, boardingStop }),
      });
      if (!response.ok) throw new Error("Link failed");
      const data = await response.json();
      
      // REAL-TIME UPDATE: Reflect changes immediately in local state
      if (data.user) {
        setProfile(data.user);
        // Force update the editable fields just in case
        setName(data.user.name || "");
        setImageUrl(data.user.image || "");
      }
      
      setStatus("SYNC_SUCCESS: Identity Nodes Updated");
      setTimeout(() => setStatus(""), 4000);
    } catch (error) { 
      setStatus(`SYNC_FAILURE: ${error.message}`); 
    }
  };

  return (
    <div className="h-screen w-screen bg-[#dee2e6] flex overflow-hidden font-sans text-slate-800">

      {/* === SIDEBAR === */}
      <div className="w-72 hidden lg:flex flex-col bg-[#1a1c23] border-r border-[#2d2f39] shrink-0 text-slate-300 shadow-2xl z-20">
        <div className="h-20 flex items-center px-8 shrink-0 border-b border-[#2d2f39]">
           <Link href="/" className="font-black text-2xl text-white flex items-center gap-3 tracking-tighter hover:opacity-80 transition-opacity">
             <div className="text-emerald-500"><Bot size={28} /></div>
             Smartransit
           </Link>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
           <div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Access Grid</p>
             <div className="space-y-1">
                <SideItem icon={<MapPinned size={18} />} label="Live Tracking" href="/tracking" />
                <SideItem icon={<Navigation2 size={18} />} label="Trip Planner" href="/route" />
                <SideItem icon={<Scan size={18} />} label="Dashboard" href="/" />
                <SideItem icon={<RouteIcon size={18} />} label="AI Console" href="/chat" />
                <SideItem icon={<User size={18} />} label="My Profile" href="/profile" active />
             </div>
           </div>
        </div>

        <div className="p-6 shrink-0 border-t border-[#2d2f39]">
             <div className="flex items-center gap-3 bg-[#2d2f39] p-3 rounded-xl border border-[#3d404d]">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 overflow-hidden">
                  {profile?.image ? (
                    <img src={profile.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.[0] || "?"
                  )}
                </div>
                <div className="flex-1 truncate">
                   <p className="text-xs font-black text-white leading-none mb-1">{profile?.name || "Student"}</p>
                   <Link href="/api/auth/signout?callbackUrl=/" className="text-[9px] font-black text-slate-500 uppercase hover:text-emerald-500">Log Out</Link>
                </div>
             </div>
        </div>
      </div>

      {/* === MAIN CONSOLE === */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#dee2e6]">
         {/* Topbar */}
         <div className="h-20 flex justify-between items-center px-10 border-b border-[#cbd5e0] shrink-0 bg-[#dee2e6]/50 backdrop-blur-md z-10 shadow-sm">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">Student Identity</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Profile Hub — {timeStr}</p>
          </div>
          <div className="flex items-center gap-3 bg-[#cbd5e0] px-4 py-2 rounded-full border border-slate-400/30 text-[9px] font-black text-slate-600 uppercase tracking-widest">
            {status && status.includes("SYNCING") ? (
               <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
            ) : (
               <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            )}
            PROTOCOL: ACTIVE
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          
          <div className="max-w-6xl mx-auto space-y-10 pb-24">
             
             {loading ? (
                <div className="h-64 bg-[#cbd5e0] border-4 border-slate-400 rounded-3xl animate-pulse flex items-center justify-center">
                   <Loader2 className="animate-spin text-slate-500" />
                </div>
             ) : (
               <div className="grid lg:grid-cols-12 gap-10 animate-[slideUp_0.4s_ease-out]">
                  
                  {/* Avatar & Summary Section */}
                  <div className="lg:col-span-4 space-y-8">
                     <div className="bg-[#cbd5e0] border-4 border-slate-400 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center text-center">
                           <div className="w-32 h-32 rounded-full bg-[#dee2e6] border-4 border-slate-400 shadow-inner flex items-center justify-center mb-8 overflow-hidden relative group/img">
                              {imageUrl ? (
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-5xl font-black text-slate-800">{name?.[0] || "?"}</span>
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                 <ImageIcon size={24} className="text-white" />
                              </div>
                           </div>
                           <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">{name || "Unnamed Node"}</h2>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">{profile?.email}</p>
                           
                           <div className="w-full bg-[#dee2e6] border-2 border-slate-400 rounded-2xl p-5 shadow-inner flex items-center gap-4">
                              <div className="w-10 h-10 bg-[#cbd5e0] rounded-xl flex items-center justify-center text-emerald-600 border border-slate-400 shadow-sm">
                                 <BusFront size={20} />
                              </div>
                              <div className="text-left">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Route Sync</p>
                                 <p className="text-xs font-black text-slate-800">{selectedRoute?.name || "LINK_PENDING"}</p>
                              </div>
                           </div>
                        </div>
                        <Bot className="absolute -right-8 -top-8 w-40 h-40 opacity-[0.03] text-slate-900 -rotate-12" />
                     </div>

                     <div className="bg-[#cbd5e0] border-4 border-slate-400 rounded-[2.5rem] p-8 shadow-xl">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6">Security Metadata</p>
                        <div className="space-y-3">
                           <CredentialItem icon={<ShieldCheck size={16}/>} label="Node Role" value="STUDENT_USER" green />
                           <CredentialItem icon={<Activity size={16}/>} label="Sync Status" value="REAL_TIME" />
                           <CredentialItem icon={<Globe size={16}/>} label="Endpoint" value="REMOTE_NODE" />
                        </div>
                     </div>
                  </div>

                  {/* Settings Console */}
                  <div className="lg:col-span-8">
                     <div className="bg-[#dee2e6] border-4 border-slate-400 rounded-[3.5rem] p-12 shadow-2xl relative h-full">
                        <div className="absolute inset-0 bg-[#cbd5e0]/20 pointer-events-none rounded-[3.1rem]"></div>
                        
                        <div className="relative z-10 space-y-12 h-full flex flex-col">
                           <div className="flex justify-between items-center bg-[#cbd5e0]/50 p-6 rounded-3xl border border-slate-400/50 shadow-sm">
                              <div>
                                 <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Identity Parameters</h3>
                                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Modify core user details and path linkage</p>
                              </div>
                              <div className="w-14 h-14 bg-[#cbd5e0] border-2 border-slate-400 rounded-2xl flex items-center justify-center text-slate-500 shadow-lg group hover:bg-slate-900 hover:text-emerald-500 transition-all cursor-pointer">
                                 <Settings size={28} className="group-hover:rotate-90 transition-transform duration-500" />
                              </div>
                           </div>

                           <form onSubmit={save} className="flex-1 flex flex-col gap-10">
                              <div className="grid md:grid-cols-2 gap-10">
                                 {/* Column 1: Core Profile */}
                                 <div className="space-y-8">
                                    <FormGroup label="Display Alias" desc="Your name across the fleet nodes" icon={<User size={18}/>}>
                                       <input 
                                          type="text"
                                          value={name}
                                          onChange={e => setName(e.target.value)}
                                          placeholder="Enter name..."
                                          className="w-full bg-[#cbd5e0] border-2 border-slate-400 rounded-2xl h-14 px-6 text-sm font-black text-slate-900 focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all"
                                       />
                                    </FormGroup>

                                    <FormGroup label="Avatar URL" desc="External image node link" icon={<ImageIcon size={18}/>}>
                                       <input 
                                          type="url"
                                          value={imageUrl}
                                          onChange={e => setImageUrl(e.target.value)}
                                          placeholder="https://..."
                                          className="w-full bg-[#cbd5e0] border-2 border-slate-400 rounded-2xl h-14 px-6 text-sm font-black text-slate-900 focus:border-emerald-500 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)] outline-none transition-all"
                                       />
                                    </FormGroup>
                                 </div>

                                 {/* Column 2: Transit Node */}
                                 <div className="space-y-8">
                                    <FormGroup label="Transit Path" desc="The primary route node for your ID" icon={<Navigation2 size={18}/>}>
                                       <select 
                                          value={preferredRouteId} 
                                          onChange={e => setPreferredRouteId(e.target.value)}
                                          className="w-full bg-[#cbd5e0] border-2 border-slate-400 rounded-2xl h-14 px-6 text-sm font-black text-slate-900 focus:border-emerald-500 outline-none transition-all shadow-inner appearance-none"
                                       >
                                          <option value="">DE-LINKED</option>
                                          {routes.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                                       </select>
                                    </FormGroup>

                                    <FormGroup label="Hub Terminal" desc="Boarding synchronization point" icon={<MapPin size={18}/>}>
                                       <select 
                                          value={boardingStop} 
                                          onChange={e => setBoardingStop(e.target.value)}
                                          className="w-full bg-[#cbd5e0] border-2 border-slate-400 rounded-2xl h-14 px-6 text-sm font-black text-slate-900 focus:border-emerald-500 outline-none transition-all shadow-inner appearance-none"
                                       >
                                          <option value="">NO_TERMINAL</option>
                                          {selectedRoute?.stops?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                       </select>
                                    </FormGroup>
                                 </div>
                              </div>

                              {/* Footer Action */}
                              <div className="mt-auto pt-10 border-t border-slate-400 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    {status && (
                                       <div className={cn(
                                          "px-6 py-3 rounded-xl border-2 flex items-center gap-3 animate-[slideIn_0.3s_ease-out]",
                                          status.includes("SUCCESS") ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-black text-[10px] uppercase" : 
                                          status.includes("FAILURE") ? "bg-rose-500/10 border-rose-500 text-rose-700 font-black text-[10px] uppercase" :
                                          "bg-slate-500/10 border-slate-500 text-slate-700 font-black text-[10px] uppercase"
                                       )}>
                                          {status.includes("SUCCESS") ? <CheckCircle2 size={16}/> : <AlertCircle size={16}/>}
                                          {status}
                                       </div>
                                    )}
                                 </div>
                                 <button 
                                    type="submit"
                                    className="bg-slate-900 text-emerald-500 px-12 py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95 border-b-8 border-slate-950 flex items-center gap-4"
                                 >
                                    <Save size={20} /> Deploy Changes
                                 </button>
                              </div>
                           </form>
                        </div>
                     </div>
                  </div>
               </div>
             )}

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}

/* === SUBCOMPONENTS === */

function SideItem({ icon, label, active, href }) {
  return (
    <Link href={href || "#"} className="w-full block group">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-bold text-sm",
        active 
          ? "bg-[#2d3436] text-white shadow-xl shadow-black/40" 
          : "text-slate-500 hover:bg-[#2d3436]/40 hover:text-slate-300"
      )}>
        <div className={cn("transition-all duration-300", active && "text-emerald-500")}>{icon}</div>
        <span className="tracking-wide">{label}</span>
      </div>
    </Link>
  );
}

function CredentialItem({ icon, label, value, green }) {
   return (
      <div className="flex items-center justify-between bg-[#dee2e6] p-4 rounded-xl border border-slate-400 shadow-sm transition-all hover:bg-[#dee2e6]/80">
         <div className="flex items-center gap-3">
            <div className="text-slate-400">{icon}</div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         </div>
         <p className={cn("text-[10px] font-black uppercase tracking-widest", green ? "text-emerald-600" : "text-slate-900")}>{value}</p>
      </div>
   );
}

function FormGroup({ label, desc, children, icon }) {
   return (
      <div className="space-y-4">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#cbd5e0] border border-slate-400 flex items-center justify-center text-slate-500 shadow-inner group-focus-within:bg-slate-900 group-focus-within:text-emerald-500 transition-colors">
               {icon}
            </div>
            <div>
               <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">{label}</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">{desc}</p>
            </div>
         </div>
         <div className="relative group">
            {children}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
               <ChevronRight size={18} />
            </div>
         </div>
      </div>
   );
}