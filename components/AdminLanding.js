"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ShieldCheck, LayoutDashboard, Bus, Activity, 
  Settings, Users, Lock, LogOut, ChevronRight,
  Database, Zap, Signal, Globe, Cpu, Terminal,
  Radar, Fingerprint, ShieldAlert, BarChart3,
  Search, FileText, Share2, ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function AdminLanding({ session }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [activeUser, setActiveUser] = useState(session?.user || null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      // Hero reveal
      tl.from(".hero-content", { y: 100, opacity: 0, duration: 1.2, ease: "power4.out" })
        .from(".stats-card", { scale: 0.8, opacity: 0, stagger: 0.1, duration: 1, ease: "back.out(1.7)" }, "-=0.8");

      // Scroll animations
      gsap.from(".admin-section", {
         opacity: 0,
         y: 50,
         stagger: 0.3,
         duration: 1.2,
         ease: "power3.out",
         scrollTrigger: {
            trigger: ".admin-grid",
            start: "top 80%",
         }
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#020617] text-white font-mono selection:bg-blue-500 selection:text-white overflow-x-hidden">
      
      {/* DEEP BLUE GLOWS */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-100" />
      </div>

      {/* HEADER */}
      <header className="relative z-[60] px-12 py-8 flex justify-between items-center max-w-[1700px] mx-auto border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/40 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <ShieldCheck className="w-6 h-6 text-blue-500" />
          </div>
          <h1 className="font-black text-xl tracking-[0.3em] uppercase text-white/90">Command<span className="text-blue-500">Node</span></h1>
        </div>

        <nav className="hidden lg:flex items-center gap-12">

          <div className="relative">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-5 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer group active:scale-95"
            >
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Global_Supervizor</span>
                  <span className="text-xs font-bold text-white/80">{activeUser?.name || "Admin_Root"}</span>
               </div>
               <Avatar className="w-10 h-10 border-2 border-blue-500/30 group-hover:border-blue-500/60 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  <AvatarImage src={activeUser?.image} />
                  <AvatarFallback className="bg-[#111] text-blue-500 font-black text-lg">{activeUser?.name?.[0] || "A"}</AvatarFallback>
               </Avatar>
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-[#0a0f1e] border border-blue-500/30 rounded-[2rem] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 border-b border-white/5 mb-3">
                   <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Command_Authority_Active</p>
                </div>
                <div className="space-y-1">
                   <DropdownItem icon={<Settings size={16} />} label="System Config" href="#" />
                   <DropdownItem icon={<LayoutDashboard size={16} />} label="Operational Matrix" href="/admin" />
                   <div className="h-px bg-white/5 my-2" />
                   <button 
                     onClick={() => signOut({ callbackUrl: "/" })}
                     className="w-full flex items-center justify-between gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group"
                   >
                     <div className="flex items-center gap-3">
                        <LogOut size={18} />
                        <span className="text-xs font-black uppercase tracking-widest">Terminate Session</span>
                     </div>
                   </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 pb-20 px-12 lg:px-24 max-w-[1700px] mx-auto overflow-hidden">
         <div className="hero-content grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
               <div className="space-y-4">
                  <p className="text-blue-500 font-black text-xs uppercase tracking-[0.8em]">Level_0_Access_Authorized</p>
                  <h1 className="text-7xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85]">
                     ADMIN <br/> COMMAND.
                  </h1>
               </div>
               <p className="text-xl text-white/40 font-bold uppercase tracking-[0.1em] leading-relaxed max-w-xl">
                  Central intelligence for the SmartTransit ecosystem. Monitor fleet compliance, synchronize neural AI logs, and manage the tactical transport grid from a unified node.
               </p>
               <div className="flex gap-6 pt-6">
                  <Link 
                     href="/admin"
                     className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)] group active:scale-[0.98]"
                  >
                     Enter Console <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link 
                     href="/tracking"
                     className="bg-white/5 hover:bg-white/10 border border-white/5 px-12 py-5 rounded-full font-black text-sm uppercase tracking-widest flex items-center gap-4 transition-all text-white/60 group"
                  >
                     Live Matrix <Globe className="group-hover:rotate-12 transition-transform opacity-40" />
                  </Link>
               </div>
            </div>

            <div className="relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
               <div className="bg-white/[0.03] border border-white/10 rounded-[4rem] p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                  <div className="grid grid-cols-2 gap-8">
                     <QuickStat label="Network_Load" val="12.4ms" sub="Global_Uptime" />
                     <QuickStat label="Active_Nodes" val="42" sub="Units_In_Vector" />
                     <QuickStat label="Signal_Lock" val="CRYPTO" sub="Secure_Protocol" />
                     <QuickStat label="AI_Sync" val="99.9%" sub="RAG_Mesh_Index" />
                  </div>
                  <div className="mt-12 p-8 bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-between group-hover:border-blue-500/40 transition-all">
                     <div className="flex items-center gap-5">
                       <Radar size={40} className="text-blue-500 animate-spin-slow" />
                       <div>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Scanning_Sectors...</p>
                          <p className="text-xs font-bold text-white uppercase tracking-tight">Omega_District_Normal</p>
                       </div>
                     </div>
                     <BarChart3 className="text-white/20" size={32} />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* ADMIN GRID EXPERIENCES */}
      <section className="relative z-10 px-12 lg:px-24 py-40 max-w-[1700px] mx-auto">
         <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
            <div className="space-y-4">
               <p className="text-blue-500 font-black text-[11px] uppercase tracking-[1em]">Operational_Briefing</p>
               <h2 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter">Command Capabilities</h2>
            </div>
         </div>

         <div className="admin-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <AdminCard 
               icon={<Bus />} 
               title="Fleet Logistics" 
               desc="Provision bus units, assign tactical routes, and manage departure synchronization across all sectors." 
               target="/admin" 
            />
            <AdminCard 
               icon={<ShieldCheck />} 
               title="Compliance Center" 
               desc="Access RTO VAHAN gateway, verify registration telemetry, and audit driver credentials instantly." 
               target="/admin"
               accent="indigo"
            />
            <AdminCard 
               icon={<Zap />} 
               title="AI Knowledge Mesh" 
               desc="Synchronize RAG route documents into the neural grid. Optimize passenger predictions in real-time." 
               target="/admin"
               accent="blue"
            />
         </div>
      </section>

      {/* TACTICAL OVERVIEW (SLEEK SECTION) */}
      <section className="admin-section relative z-10 px-12 lg:px-24 py-40 max-w-[1700px] mx-auto overflow-hidden">
         <div className="bg-gradient-to-br from-blue-900/40 to-transparent border border-white/5 rounded-[5rem] p-16 lg:p-32 flex flex-col md:flex-row gap-24 items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[60rem] h-[60rem] bg-blue-500/5 rounded-full blur-[200px] -mt-80 -mr-80" />
            
            <div className="flex-1 space-y-10 relative z-10">
               <div className="w-20 h-2 bg-blue-500 shadow-[0_0_20px_#3b82f6]" />
               <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">Security <br/> Master Hub</h2>
               <p className="text-xl text-white/40 font-bold uppercase tracking-widest leading-relaxed">
                  Every signal, panic alert, and overspeed violation is archived and analyzed. Maintain total control over the transit safety index.
               </p>
               <div className="grid grid-cols-2 gap-8">
                  <div className="flex items-center gap-4 text-white/30">
                     <Fingerprint size={24} className="text-blue-500" />
                     <span className="text-[11px] font-black uppercase tracking-widest">Biometric_Audit</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/30">
                     <Lock size={24} className="text-blue-500" />
                     <span className="text-[11px] font-black uppercase tracking-widest">Encrypted_Uplink</span>
                  </div>
               </div>
            </div>

            <div className="w-full md:w-2/5 relative z-10">
               <div className="bg-black/80 border border-white/10 rounded-[3rem] p-12 space-y-8 backdrop-blur-2xl shadow-2xl group hover:border-blue-500/40 transition-all">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4">Live_Terminal_Feed</h4>
                  <div className="space-y-4">
                     <TerminalMock text="SYS_AUTH: Level_03 Access Granted" time="0.02ms" />
                     <TerminalMock text="RTO_SYNC: VAHAN_GATEWAY_UP" time="0.8s" />
                     <TerminalMock text="GRID_SCAN: All Systems Nominal" time="--:--" active />
                  </div>
                  <div className="pt-8 border-t border-white/5 text-center">
                     <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Grid_Auth: ac4d55eb-3b91</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 px-12 py-24 border-t border-white/5 bg-[#020617]">
         <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-white/30 uppercase font-black text-[10px] tracking-[0.4em]">
            <div className="flex items-center gap-5 text-white/90">
               <ShieldCheck className="w-6 h-6 text-blue-500" />
               <span>CommandNode v6.2.2</span>
            </div>
            <div className="flex gap-12">
               <a href="#" className="hover:text-blue-500 transition-colors">Audit_Log</a>
               <a href="#" className="hover:text-blue-500 transition-colors">RTO_Portal</a>
               <a href="#" className="hover:text-blue-500 transition-colors">Protocol_X</a>
            </div>
            <p>© 2026 Fleet Operations Command</p>
         </div>
      </footer>

    </div>
  );
}

function NavOption({ label, href, active }) {
   return (
      <Link href={href} className={cn(
         "text-[11px] font-black uppercase tracking-widest transition-all",
         active ? "text-blue-500 border-b-2 border-blue-500 pb-1" : "text-white/40 hover:text-white"
      )}>
         {label}
      </Link>
   );
}

function DropdownItem({ icon, label, href }) {
   return (
      <Link 
         href={href}
         className="flex items-center gap-4 px-4 py-4 rounded-2xl text-white/70 hover:bg-blue-500/5 hover:text-blue-500 transition-all group"
      >
         <div className="text-white/30 group-hover:text-blue-500 transition-colors">
            {icon}
         </div>
         <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </Link>
   );
}

function QuickStat({ label, val, sub }) {
   return (
      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5 group hover:border-blue-500/20 transition-all">
         <p className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest mb-1">{label}</p>
         <p className="text-2xl font-black text-white mb-1">{val}</p>
         <p className="text-[9px] font-medium text-white/20 uppercase tracking-widest leading-none">{sub}</p>
      </div>
   );
}

function AdminCard({ icon, title, desc, target, accent = "blue" }) {
   return (
      <Link href={target} className={cn(
         "group p-12 rounded-[3.5rem] border transition-all duration-500 flex flex-col space-y-8 relative overflow-hidden",
         accent === "indigo" ? "bg-indigo-900/5 border-indigo-500/10 hover:border-indigo-500/40" : "bg-blue-900/5 border-blue-500/10 hover:border-blue-500/40"
      )}>
         <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] rounded-full blur-3xl translate-x-16 -translate-y-16 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
         <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-500 group-hover:scale-110",
            accent === "indigo" ? "bg-indigo-500/10 text-indigo-500" : "bg-blue-500/10 text-blue-500"
         )}>
            {icon}
         </div>
         <div className="space-y-4">
            <h3 className="text-3xl font-black uppercase tracking-tight">{title}</h3>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed">
               {desc}
            </p>
         </div>
         <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-blue-500 sm:opacity-0 group-hover:opacity-100 transition-all">
            Access_Terminal <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
         </div>
      </Link>
   );
}

function TerminalMock({ text, time, active }) {
   return (
      <div className="flex items-center justify-between gap-4 font-mono">
         <div className="flex items-center gap-3 overflow-hidden">
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", active ? "bg-blue-500 animate-pulse" : "bg-white/20")} />
            <p className={cn("text-[10px] uppercase tracking-tighter truncate", active ? "text-white" : "text-white/40")}>{text}</p>
         </div>
         <span className="text-[9px] font-black text-blue-500/40">{time}</span>
      </div>
   );
}
