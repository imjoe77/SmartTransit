"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, Activity, Settings, LogOut, Bus, 
  AlertTriangle, Radio, Terminal as TerminalIcon, 
  Cpu, Database, Network, Zap, User, Clock
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function AdminProfile({ session }) {
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toISOString().replace('T', ' ').substring(0, 19));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Fleet_Units_Live", value: "12/15", status: "Nominal", icon: <Bus size={14} /> },
    { label: "Neural_Link_Latency", value: "24ms", status: "Optimal", icon: <Network size={14} /> },
    { label: "Database_Load", value: "32.4%", status: "Stable", icon: <Database size={14} /> },
    { label: "Node_Security", value: "99.9%", status: "Encrypted", icon: <ShieldCheck size={14} /> },
  ];

  const logs = [
    { time: "18:42:01", event: "SYS_KERNEL_SYNC", detail: "Vector mesh alignment complete." },
    { time: "18:43:45", event: "USER_AUTH_GRANTED", detail: "ID: ADMIN_01 access validated." },
    { time: "18:45:12", event: "RAG_KNOWLEDGE_SYNC", detail: "Route 04 indexed successfully." },
    { time: "18:48:30", event: "NETWORK_GATEWAY", detail: "Socket_IO handshake established." },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 font-mono text-slate-400">
      
      {/* TACTICAL HEADER */}
      <div className="relative p-10 bg-black border border-white/10 rounded-[2rem] overflow-hidden group">
         {/* Background Grid Pattern */}
         <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
              style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         
         <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">System_Administrator_Terminal</span>
               </div>
               <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase leading-none mb-4">
                  Admin <span className="text-blue-500">Control_Panel</span>
               </h1>
               <div className="flex flex-wrap gap-4">
                  <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest">
                     Node_ID: <span className="text-white">ALPHA_SYNC_01</span>
                  </span>
                  <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest">
                     Uptime: <span className="text-white">124:12:05</span>
                  </span>
                  <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
                     <Clock size={10} /> {timestamp}
                  </span>
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md w-full lg:w-72">
               <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                     {session?.user?.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  <div>
                     <p className="text-white font-black uppercase text-sm">{session?.user?.name || "Root_Admin"}</p>
                     <p className="text-[10px] text-white/40">{session?.user?.email || "sys@admin.internal"}</p>
                  </div>
               </div>
               <Link 
                 href="/api/auth/signout"
                 className="flex items-center justify-center gap-2 w-full py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
               >
                  <LogOut size={14} /> De-Authenticate_User
               </Link>
            </div>
         </div>
      </div>

      {/* TECHNICAL METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
            <div key={i} className="bg-black/40 border border-white/5 p-6 rounded-[1.8rem] group hover:border-blue-500/30 transition-all">
               <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/5 rounded-xl text-white/40 group-hover:text-blue-400 transition-colors">
                     {stat.icon}
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">State</span>
                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{stat.status}</span>
                  </div>
               </div>
               <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
               <h3 className="text-3xl font-black text-white tracking-tighter font-mono">{stat.value}</h3>
               
               {/* Kinetic Bar */}
               <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500/50 group-hover:bg-blue-500 group-hover:shadow-[0_0_10px_#3b82f6] transition-all duration-700 w-2/3" />
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* SYSTEM PROTOCOLS */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
               <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                  <Cpu size={16} /> Technical_Protocols
               </h3>
               <div className="space-y-4">
                  <ActionButton icon={<ShieldCheck size={14} />} label="Security_Audit" desc="Run deep node scan" />
                  <ActionButton icon={<Activity size={14} />} label="Telemetry_Dump" desc="Extract raw mission vectors" />
                  <ActionButton icon={<Zap size={14} />} label="AI_Core_Reset" desc="Re-index RAG architecture" />
                  <ActionButton icon={<Settings size={14} />} label="Global_Override" desc="Execute root sequence" color="red" />
               </div>
            </div>
         </div>

         {/* SYSTEM LOGS / TERMINAL */}
         <div className="lg:col-span-2">
            <div className="bg-black border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col h-full">
               <div className="bg-white/5 px-8 py-4 border-b border-white/10 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <TerminalIcon size={14} className="text-blue-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Live_Kernel_Log</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
               </div>
               <div className="p-8 space-y-4 flex-1">
                  {logs.map((log, i) => (
                     <div key={i} className="flex gap-6 text-[11px] group">
                        <span className="text-white/20 font-mono shrink-0">[{log.time}]</span>
                        <span className="text-blue-500 font-black shrink-0">{log.event}</span>
                        <span className="text-white/60 group-hover:text-white transition-colors tracking-tight">{log.detail}</span>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] uppercase font-bold text-white/30">Verified</span>
                        </div>
                     </div>
                  ))}
                  <div className="pt-4 flex items-center gap-2">
                     <span className="text-blue-500 animate-pulse">{">"}</span>
                     <span className="w-2 h-4 bg-blue-500/50 animate-pulse" />
                  </div>
               </div>
               <div className="bg-white/5 px-8 py-3 text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
                  Total_Packet_Synchronized: 1.2M // Integrity: 100.0%
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

function ActionButton({ icon, label, desc, color }) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left group",
      color === 'red' 
        ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
        : "bg-white/5 border-white/10 text-white/60 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400"
    )}>
       <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-white/5 group-hover:scale-110 transition-transform">
             {icon}
          </div>
          <div>
             <p className="font-black text-xs uppercase tracking-tighter">{label}</p>
             <p className="text-[10px] opacity-40 italic">{desc}</p>
          </div>
       </div>
    </button>
  );
}
