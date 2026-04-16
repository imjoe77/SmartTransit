"use client";

import { useEffect, useState } from "react";
import { Navigation, Play, Pause, RotateCcw, Box, MapPin, Gauge } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function TripAnalytics() {
  const [position, setPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const stops = [
    { name: "Sector_HQ", time: "08:00", speed: "0km/h", status: "Completed" },
    { name: "Nexus_Bridge", time: "08:15", speed: "42km/h", status: "Completed" },
    { name: "Neon_Plaza", time: "08:30", speed: "38km/h", status: "Delayed_2m" },
    { name: "Cyber_Port", time: "08:45", speed: "45km/h", status: "In_Transit" },
    { name: "Alpha_Terminal", time: "09:00", speed: "0km/h", status: "Pending" },
  ];

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setPosition((prev) => (prev < stops.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* REPLAY CONTROLS & TIMELINE */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-black/40 border border-[#39FF14]/20 rounded-[2.5rem] p-8 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
             <div className="flex items-center gap-2 px-4 py-2 bg-[#39FF14]/10 rounded-full border border-[#39FF14]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
                <span className="text-[10px] font-bold text-[#39FF14] uppercase tracking-widest">Replay_Active</span>
             </div>
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
             <Navigation className="text-[#39FF14]" size={24} />
             Mission_Vector_Replay
          </h3>

          {/* SIMULATED MAP / PROGRESS */}
          <div className="relative h-[300px] bg-white/5 rounded-3xl border border-white/5 overflow-hidden mb-8">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.05)_0%,transparent_70%)]" />
             
             {/* VECTOR PATH */}
             <div className="absolute top-1/2 left-10 right-10 h-1 bg-white/10 rounded-full">
                <div 
                  className="absolute h-full bg-[#39FF14] shadow-[0_0_15px_#39FF14] transition-all duration-[2000ms] ease-linear"
                  style={{ width: `${(position / (stops.length - 1)) * 100}%` }}
                />
             </div>

             {/* NODES */}
             <div className="absolute top-1/2 left-10 right-10 flex justify-between -translate-y-1/2">
                {stops.map((stop, i) => (
                   <div key={i} className="relative">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 transition-all duration-500",
                        i <= position ? "bg-[#39FF14] border-[#39FF14] scale-125" : "bg-black border-white/20"
                      )} />
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                         <div className={cn("text-[8px] font-black uppercase tracking-tighter mb-1", i <= position ? "text-[#39FF14]" : "text-white/20")}>
                            {stop.name}
                         </div>
                         <div className="text-[10px] font-mono text-white/40">{stop.time}</div>
                      </div>
                   </div>
                ))}
             </div>

             {/* ACTIVE SHIP ICON */}
             <div 
               className="absolute top-1/2 -translate-y-[150%] transition-all duration-[2000ms] ease-linear"
               style={{ left: `calc(2.5rem + ${(position / (stops.length - 1)) * (100)}% - 2.5rem)` }}
             >
                <div className="bg-[#39FF14] p-3 rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.5)] animate-bounce">
                   <Box size={20} className="text-black" />
                </div>
             </div>
          </div>

          {/* CONTROLS */}
          <div className="flex items-center justify-center gap-6">
             <button 
               onClick={() => setPosition(0)}
               className="p-4 rounded-2xl border border-white/10 hover:bg-white/5 text-white/60 hover:text-white transition-all"
             >
                <RotateCcw size={20} />
             </button>
             <button 
               onClick={() => setIsPlaying(!isPlaying)}
               className="w-20 h-20 rounded-full bg-[#39FF14] flex items-center justify-center text-black shadow-[0_0_40px_rgba(57,255,20,0.4)] hover:scale-110 active:scale-95 transition-all"
             >
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
             </button>
             <div className="w-12" /> {/* Spacer */}
          </div>
        </div>
      </div>

      {/* METRIC SIDEBAR */}
      <div className="space-y-6">
        <div className="bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-[2rem] p-6">
           <div className="flex items-center gap-3 mb-6">
              <Gauge className="text-[#39FF14]" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">Vessel_State</span>
           </div>
           
           <div className="space-y-6">
              <div>
                 <div className="text-white/40 text-[10px] uppercase font-bold mb-1">Velocity_Scalar</div>
                 <div className="text-3xl font-black text-white font-mono">{stops[position].speed}</div>
              </div>
              <div>
                 <div className="text-white/40 text-[10px] uppercase font-bold mb-1">Current_Checkpoint</div>
                 <div className="text-xl font-black text-[#39FF14] uppercase tracking-tighter">{stops[position].name}</div>
              </div>
              <div className="pt-6 border-t border-white/5">
                 <div className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                    stops[position].status === "Delayed_2m" ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/40"
                 )}>
                    {stops[position].status}
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6">
           <div className="flex items-center gap-3 mb-4">
              <MapPin className="text-white/40" size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Mission_Stats</span>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/20 p-4 rounded-2xl">
                 <div className="text-[8px] font-bold text-white/20 mb-1">TOTAL_KM</div>
                 <div className="text-lg font-black text-white">12.4</div>
              </div>
              <div className="bg-black/20 p-4 rounded-2xl">
                 <div className="text-[8px] font-bold text-white/20 mb-1">STOPS</div>
                 <div className="text-lg font-black text-white">08/12</div>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
}
