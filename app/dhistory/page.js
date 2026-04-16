"use client";

import { useState, useEffect } from "react";
import AppFrame from "@/components/layout/AppFrame";
import TacticalHistory from "@/components/dashboard/TacticalHistory";
import QuickMetrics from "@/components/dashboard/QuickMetrics";
import TripAnalytics from "@/components/dashboard/TripAnalytics"; // I need to move the previous content here
import { Library, Activity, Map, Database, History, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function DriverHistoryPage() {
  const [activeTab, setActiveTab] = useState("logs");
  const [session, setSession] = useState(null);

  useEffect(() => {
     // Fetch session client side since I'm using "use client" now for tabs
     const fetchSession = async () => {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setSession(data);
     };
     fetchSession();
  }, []);

  const tabs = [
    { id: "logs", label: "Mission_Logs", icon: <Database size={16} />, component: <TacticalHistory /> },
    { id: "stats", label: "Performance_HUD", icon: <Activity size={16} />, component: <QuickMetrics /> },
    { id: "replay", label: "Mission_Replay", icon: <Map size={16} />, component: <TripAnalytics /> },
  ];

  return (
    <AppFrame session={session}>
      <div className="space-y-10 min-h-screen pb-20 p-6 lg:p-10 font-sans">
        
        {/* HEADER AREA */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#39FF14]/10 pb-10">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <History className="text-[#39FF14]" size={20} />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#39FF14]">Fleet_Intelligence_Unit</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                 Intelligence <span className="text-[#39FF14]">&</span> Archival
              </h1>
           </div>

           {/* TAB NAVIGATION */}
           <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-[1.5rem] backdrop-blur-md">
              {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={cn(
                     "flex items-center gap-3 px-6 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all",
                     activeTab === tab.id 
                       ? "bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]" 
                       : "text-white/40 hover:text-white"
                   )}
                 >
                    {tab.icon} {tab.label}
                 </button>
              ))}
           </div>
        </div>

        {/* ACTIVE MODULE CONTAINER */}
        <div className="relative">
           {tabs.find(t => t.id === activeTab)?.component}
        </div>

      </div>
    </AppFrame>
  );
}