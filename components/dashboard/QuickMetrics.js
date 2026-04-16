"use client";

import { Eye, Zap, Activity, Clock, Navigation2, Star, ShieldCheck, Map, Gauge } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function QuickMetrics() {
  const stats = [
    { label: "Neural_Drift", value: "0.02%", icon: <Eye size={16} />, color: "text-[#39FF14]" },
    { label: "Sync_Reliability", value: "99.8%", icon: <Zap size={16} />, color: "text-[#39FF14]" },
    { label: "Mission_XP", value: "14,200", icon: <Star size={16} />, color: "text-amber-400" },
    { label: "Avg_Variance", value: "1.4m", icon: <Clock size={16} />, color: "text-[#39FF14]" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* PERFORMANCE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {stats.map((stat, i) => (
            <div key={i} className="bg-black border-2 border-[#39FF14]/10 rounded-[2rem] p-6 group hover:border-[#39FF14]/30 transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  {stat.icon}
               </div>
               <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-2 rounded-lg bg-white/5", stat.color)}>
                     {stat.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{stat.label}</span>
               </div>
               <p className={cn("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
            </div>
         ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
         {/* OPTICAL ANALYTICS WIDGET */}
         <div className="lg:col-span-8 bg-black border-2 border-[#39FF14]/10 rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(57,255,20,0.03)_0%,transparent_70%)]" />
            
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#39FF14]/10 rounded-2xl border border-[#39FF14]/20">
                     <Gauge className="text-[#39FF14]" size={20} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Biometric_Efficiency_Stream</h3>
                     <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">Real-time analytical delta of fatigue monitoring performance.</p>
                  </div>
               </div>
               <div className="hidden sm:flex items-center gap-2 bg-[#39FF14]/5 px-4 py-2 rounded-full border border-[#39FF14]/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-ping" />
                  <span className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest">Live_Telemetry</span>
               </div>
            </div>

            <div className="h-48 w-full flex items-end gap-2 px-2 pb-2 border-b border-white/5">
               {[40, 65, 45, 80, 55, 90, 70, 40, 85, 60, 45, 30, 75, 50, 65, 80, 40, 20, 55].map((val, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-[#39FF14]/20 rounded-t-sm hover:bg-[#39FF14] transition-all cursor-crosshair group relative" 
                    style={{ height: `${val}%` }}
                  >
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}%
                     </div>
                  </div>
               ))}
            </div>
            
            <div className="flex justify-between mt-6 text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
               <span>08:00_NODE</span>
               <span>12:00_NODE</span>
               <span>16:00_NODE</span>
               <span>20:00_NODE</span>
            </div>
         </div>

         {/* SECURITY PROTOCOL STATUS */}
         <div className="lg:col-span-4 bg-black border-2 border-[#39FF14]/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
            <div>
               <h4 className="text-[11px] font-black text-white/60 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-[#39FF14]" /> Safety_Protocol_Check
               </h4>
               <div className="space-y-5">
                  <ProtocolRow label="Optical_Link" status="ACTIVE" ok />
                  <ProtocolRow label="Telemetry_Sync" status="ACTIVE" ok />
                  <ProtocolRow label="Neural_Filter" status="ACTIVE" ok />
                  <ProtocolRow label="Wait_Indexing" status="PENDING" />
               </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 text-center">
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                  System operational integrity confirmed by central safety oracle.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}

function ProtocolRow({ label, status, ok }) {
  return (
    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
       <span className="text-white/40">{label}</span>
       <span className={cn(ok ? "text-[#39FF14]" : "text-amber-400")}>{status}</span>
    </div>
  );
}
