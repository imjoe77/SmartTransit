"use client";

import { useState } from "react";
import { 
  History, Calendar, Clock, Map, Navigation, 
  ChevronRight, ArrowUpRight, Search, Filter,
  CheckCircle2, XCircle, Star, Download, Database
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MOCK_TRIPS = [
  { 
    id: "TRP-8482", 
    date: "Oct 24, 2026", 
    time: "08:00 AM", 
    route: "North Line", 
    duration: "45m", 
    delay: "None", 
    status: "completed",
    stops: ["North Campus Terminal", "Engineering Block", "Main Library", "Student Union", "South Campus Station"],
    driverRating: "5.0",
  },
  { 
    id: "TRP-8483", 
    date: "Oct 23, 2026", 
    time: "02:15 PM", 
    route: "South Line", 
    duration: "52m", 
    delay: "+7 mins", 
    status: "completed",
    stops: ["South Station", "Dorms", "Stadium", "Science Building", "North Campus"],
    driverRating: "4.8",
  },
  { 
    id: "TRP-8484", 
    date: "Oct 22, 2026", 
    time: "09:00 AM", 
    route: "Express Mall", 
    duration: "30m", 
    delay: "+2 mins", 
    status: "completed",
    stops: ["Main Campus", "Downtown Mall"],
    driverRating: "4.9",
  },
  { 
    id: "TRP-8485", 
    date: "Oct 21, 2026", 
    time: "07:30 AM", 
    route: "North Line", 
    duration: "--", 
    delay: "--", 
    status: "cancelled",
    stops: ["North Campus Terminal"],
    driverRating: "--",
  },
];

export default function TacticalHistory() {
  const [selectedRoute, setSelectedRoute] = useState("All Routes");
  const [selectedTrip, setSelectedTrip] = useState(null);

  const filteredTrips = MOCK_TRIPS.filter(trip => 
    selectedRoute === "All Routes" ? true : trip.route.includes(selectedRoute)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* FILTER HUD */}
      <div className="bg-black border-2 border-[#39FF14]/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(57,255,20,0.03)_0%,transparent_50%)]" />
         
         <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-[#39FF14]/10 rounded-2xl border border-[#39FF14]/30">
               <Database className="text-[#39FF14]" size={20} />
            </div>
            <div>
               <h2 className="text-xl font-black text-white uppercase tracking-tighter">Mission_Archive_Retrieval</h2>
               <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Accessing historical trip vectors from secure node.</p>
            </div>
         </div>

         <div className="flex items-center gap-4 relative z-10">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39FF14]/40 group-focus-within:text-[#39FF14] transition-colors" size={14} />
               <input 
                 type="text" 
                 placeholder="Search Trip_ID..." 
                 className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-[#39FF14]/50 transition-all w-48"
               />
            </div>
            <select 
               value={selectedRoute}
               onChange={(e) => setSelectedRoute(e.target.value)}
               className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-[#39FF14]/50 transition-all cursor-pointer"
            >
               <option className="bg-slate-900 border-none">All Routes</option>
               <option className="bg-slate-900 border-none text-white">North Line</option>
               <option className="bg-slate-900 border-none text-white">South Line</option>
               <option className="bg-slate-900 border-none text-white">Express Mall</option>
            </select>
         </div>
      </div>

      {/* TRIP TABLE */}
      <div className="bg-black border-2 border-[#39FF14]/10 rounded-[2.5rem] overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="bg-white/[0.02] border-b border-white/5">
                  <th className="py-5 px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Vector_ID / Sync_Date</th>
                  <th className="py-5 px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Deployment_Sector</th>
                  <th className="py-5 px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Duration</th>
                  <th className="py-5 px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Status</th>
                  <th className="py-5 px-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
               {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="group hover:bg-[#39FF14]/[0.02] transition-colors">
                     <td className="py-5 px-8">
                        <div className="font-black text-white text-sm tracking-tight">{trip.id}</div>
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{trip.date} • {trip.time}</div>
                     </td>
                     <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                           <div className={cn(
                             "w-1.5 h-1.5 rounded-full",
                             trip.route.includes('North') ? 'bg-[#39FF14] shadow-[0_0_8px_#39FF14]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'
                           )} />
                           <span className="text-white/80 font-black text-[11px] uppercase tracking-widest">{trip.route}</span>
                        </div>
                     </td>
                     <td className="py-5 px-8">
                        <div className="text-white font-black text-xs font-mono">{trip.duration}</div>
                        <div className={cn(
                          "text-[8px] font-black uppercase tracking-[0.2em] mt-1",
                          trip.delay === 'None' ? 'text-white/20' : 'text-amber-500'
                        )}>
                           Variance: {trip.delay}
                        </div>
                     </td>
                     <td className="py-5 px-8">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest",
                          trip.status === 'completed' ? 'bg-[#39FF14]/5 border-[#39FF14]/20 text-[#39FF14]' : 'bg-red-500/5 border-red-500/20 text-red-500'
                        )}>
                           {trip.status === 'completed' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                           {trip.status}
                        </div>
                     </td>
                     <td className="py-5 px-8 text-right">
                        <button 
                          onClick={() => setSelectedTrip(trip)}
                          className="p-2 border border-white/10 rounded-lg text-white/40 hover:text-[#39FF14] hover:border-[#39FF14]/50 hover:bg-[#39FF14]/10 transition-all group/btn"
                        >
                           <ArrowUpRight className="group-hover/btn:rotate-45 transition-transform" size={16} />
                        </button>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* MODAL DETIALS */}
      {selectedTrip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-black border-2 border-[#39FF14]/20 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(57,255,20,0.1)] relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#39FF14]/40 to-transparent" />
              
              <div className="p-10">
                 <div className="flex justify-between items-start mb-10">
                    <div>
                       <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Vector_Details</h2>
                       <div className="flex items-center gap-3">
                          <span className="bg-[#39FF14] text-black text-[9px] font-black px-2 py-0.5 rounded uppercase">{selectedTrip.id}</span>
                          <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">{selectedTrip.date}</span>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSelectedTrip(null)}
                      className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
                    >
                       <XCircle size={20} />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-6 mb-10">
                    <ModalStat label="Duration" value={selectedTrip.duration} />
                    <ModalStat label="Wait_Variance" value={selectedTrip.delay} highlight={selectedTrip.delay !== 'None'} />
                    <ModalStat label="Fleet_rating" value={`${selectedTrip.driverRating} XP`} />
                    <ModalStat label="Link_Status" value={selectedTrip.status.toUpperCase()} />
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.4em] mb-4 flex items-center gap-2">
                       <Map size={14} /> Mission_Stops_Sequence
                    </h3>
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-4 custom-scrollbar">
                       {selectedTrip.stops.map((stop, i) => (
                         <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
                            <span className="text-[10px] font-black text-[#39FF14]/40 w-5">{String(i+1).padStart(2, '0')}</span>
                            <span className="text-sm font-bold text-white/80">{stop}</span>
                            <div className="ml-auto w-1 h-1 rounded-full bg-[#39FF14]/20" />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="mt-10 pt-10 border-t border-white/5 flex gap-4">
                    <button className="flex-1 bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all">
                       Download_Intel_Report
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(57,255,20,0.2); border-radius: 10px; }
      `}} />
    </div>
  );
}

function ModalStat({ label, value, highlight }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-2">{label}</span>
       <span className={cn("text-lg font-black tracking-tight", highlight ? "text-amber-500" : "text-white")}>{value}</span>
    </div>
  );
}
