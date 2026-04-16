"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Signal, Zap, Target, Crosshair, Activity } from "lucide-react";

export default function DriverMap() {
  const [position, setPosition] = useState(0);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await fetch("/api/driver/assignment");
        const data = await res.json();
        if (data.bus) setAssignment(data);
      } catch (err) {
        console.error("Map fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();

    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const stops = assignment?.route?.stops || [];
  const startStop = stops[0]?.name || "Sector_Alpha";
  const midStop = stops[Math.floor(stops.length / 2)]?.name || "Transit_Nexus";
  const endStop = stops[stops.length - 1]?.name || "College_Unit";

  if (loading) {
     return (
       <div className="h-[400px] bg-black flex items-center justify-center border-t-2 border-[#39FF14]/20">
          <Activity className="text-[#39FF14] animate-spin" size={32} />
       </div>
     );
  }

  return (
    <section className="relative w-full overflow-hidden bg-black border-t-2 border-[#39FF14]/30">
      
      {/* Map Header HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 p-8 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-black/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#39FF14]/30 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
           <div className="flex items-center gap-6">
             <div className="w-12 h-12 bg-[#39FF14]/10 border border-[#39FF14] rounded-2xl flex items-center justify-center text-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                <Target size={24} className="animate-pulse" />
             </div>
             <div>
               <h3 className="text-[#39FF14] font-black text-2xl tracking-tighter flex items-center gap-3 uppercase">
                 Tactical_GPS_Feed
               </h3>
               <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                 {assignment?.bus?.busId || "NODE_UNSET"} • {assignment?.route?.name || "LINK_PENDING"}
               </p>
             </div>
           </div>
           
           <div className="hidden md:flex items-center gap-12">
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Current_Velocity</p>
                <p className="text-3xl font-black text-[#39FF14] tracking-tighter">42 <span className="text-xs">MPH</span></p>
              </div>
              <div className="h-10 w-px bg-[#39FF14]/20"></div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mb-1">Link_Quality</p>
                <div className="flex items-center gap-2 text-[#39FF14]">
                    <Signal size={20} />
                    <span className="text-xl font-black">98%</span>
                </div>
              </div>
           </div>
        </div>
      </div>

      {/* TACTICAL MAP AREA */}
      <div className="relative w-full h-[60vh] min-h-[500px] bg-black">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.07] contrast-[200%] brightness-[50%] skew-y-1"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80')" }}
        />
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]" />
        <div className="absolute inset-0 z-1 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#39FF14 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* The Route Spine */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-40 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none">
              <path 
                d="M -10,80 Q 200,30 400,80 T 800,80 T 1200,80 T 1600,80 T 2000,80" 
                fill="none" 
                stroke="#39FF14" 
                strokeWidth="12" 
                className="opacity-10 blur-xl"
              />
              <path 
                d="M -10,80 Q 200,30 400,80 T 800,80 T 1200,80 T 1600,80 T 2000,80" 
                fill="none" 
                stroke="#39FF14" 
                strokeWidth="2" 
                strokeDasharray="15 15"
                className="opacity-40"
              />
            </svg>
        </div>

        {/* Dynamic Station Nodes */}
        <StationNode left="20%" label={startStop} />
        <StationNode left="50%" label={midStop} />
        <StationNode left="80%" label={endStop} />

        {/* THE RADIUM BUS MARKER */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-100 ease-linear"
          style={{ left: `${position}%`, marginTop: `${Math.sin(position / 12) * 15}px` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 bg-[#39FF14]/20 rounded-full animate-ping" />
            <div className="absolute w-20 h-20 bg-[#39FF14]/10 rounded-full blur-2xl" />
            
            <div className="relative w-14 h-14 bg-black border-4 border-[#39FF14] rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.6)] flex items-center justify-center text-[#39FF14]">
               <Navigation size={28} style={{ transform: `rotate(${90 + Math.cos(position/12)*20}deg)` }} fill="currentColor" className="transition-transform duration-500" />
            </div>
            
            <div className="absolute bottom-full mb-6 flex flex-col items-center">
                <div className="bg-black/90 border-2 border-[#39FF14] px-4 py-2 rounded-xl backdrop-blur-md shadow-2xl flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">{assignment?.bus?.busId || "UNIT"}: ON_ROUTE</span>
                </div>
                <div className="w-1 h-6 bg-gradient-to-t from-[#39FF14] to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* HUD DATA FOOTER */}
      <div className="w-full bg-black border-t-2 border-[#39FF14]/30 p-6 relative overflow-hidden">
         <div className="absolute inset-0 bg-[#39FF14]/5 opacity-50" />
         <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10 text-[10px] font-black tracking-widest text-[#39FF14]/60 uppercase">
             <div className="flex gap-10">
                <span className="flex items-center gap-2 text-white/50"><div className="w-2 h-2 rounded-full border border-[#39FF14]"></div> Static_Nodes</span>
                <span className="flex items-center gap-2 text-[#39FF14]"><div className="w-2 h-2 rounded-full bg-[#39FF14]"></div> Active_Unit</span>
                <span className="flex items-center gap-2 text-white/50"><div className="w-4 h-0.5 bg-[#39FF14]/40"></div> Vector_Path</span>
             </div>
             <p className="flex items-center gap-2 bg-[#39FF14]/10 px-4 py-2 border border-[#39FF14]/20 rounded-full text-[#39FF14]">
               <Zap size={14} fill="currentColor" />
               System_Latency: 12ms // Ref: Alpha_Link
             </p>
         </div>
      </div>
    </section>
  );
}

function StationNode({ left, label }) {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 -mt-4 transition-all duration-700" style={{ left }}>
        <div className="relative flex flex-col items-center group">
            <div className="w-4 h-4 bg-black border-2 border-white rounded-full z-10 shadow-[0_0_15px_rgba(255,255,255,0.4)] group-hover:scale-150 group-hover:bg-[#39FF14] group-hover:border-[#39FF14] transition-all duration-300"></div>
            <div className="absolute bottom-6 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded opacity-40 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">{label}</p>
            </div>
        </div>
    </div>
  );
}
