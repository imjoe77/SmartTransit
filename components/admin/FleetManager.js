"use client";

import { useState, useEffect } from "react";
import { 
  Bus, ShieldCheck, FileText, Settings, 
  Search, Info, Tool, AlertTriangle, 
  User, MapPin, Zap, Database, Clock,
  RefreshCw, CheckCircle2, XCircle, SearchIcon
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function FleetManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [selectedId, setSelectedId] = useState("KA01SY0421");
  const [rtoData, setRtoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fleetList = [
    { id: "KA01SY0421", reg: "KA 01 SY 0421", model: "Tata Starbus 40S", status: "Active" },
    { id: "KA07Y3705", reg: "KA 07 Y 3705", model: "Honda City 125", status: "Active" },
    { id: "KL01BZ5566", reg: "KL 01 BZ 5566", model: "Eicher Skyline 32S", status: "Active" },
  ];

  useEffect(() => {
    if (selectedId) fetchRTO(selectedId);
  }, [selectedId]);

  const fetchRTO = async (reg) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rto/${reg}`);
      const data = await res.json();
      if (res.ok) {
        setRtoData(data);
      } else {
        setError(data.error);
        setRtoData(null);
      }
    } catch (err) {
      setError("UPLINK_FAILURE: REGISTRY_TIMEOUT");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e) => {
     e.preventDefault();
     if (!manualInput.trim()) return;
     setSelectedId(manualInput.toUpperCase().replace(/\s+/g, ''));
  };

  const filtered = fleetList.filter(v => 
    v.reg.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row gap-10 font-mono text-slate-400">
      
      {/* SIDEBAR DIRECTORY */}
      <div className="w-full lg:w-96 shrink-0 space-y-6">
         
         {/* MANUAL SEARCH PAD */}
         <div className="bg-blue-600 border border-blue-500 rounded-[2rem] p-6 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-6 flex items-center gap-2">
               <Zap size={14} /> Tactical_Search
            </h2>
            <form onSubmit={handleManualSearch} className="relative">
               <input 
                 className="w-full bg-black/20 border border-white/20 rounded-2xl pl-5 pr-12 py-4 text-xs font-black text-white placeholder:text-white/40 focus:border-white outline-none transition-all"
                 placeholder="Enter_Reg_No (e.g. KA01...)"
                 value={manualInput}
                 onChange={(e) => setManualInput(e.target.value)}
               />
               <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white text-blue-600 rounded-xl hover:scale-110 transition-transform">
                  <SearchIcon size={16} />
               </button>
            </form>
         </div>

         {/* FLEET LIST */}
         <div className="bg-black border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6 flex items-center gap-3">
               <Database size={14} className="text-blue-500" /> Operational_Registry
            </h2>
            
            <div className="relative mb-6">
               <input 
                 className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold text-white focus:border-blue-500 outline-none"
                 placeholder="Filter_Directory..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
               {filtered.map(v => (
                  <button
                    key={v.id}
                    onClick={() => {
                        setSelectedId(v.id);
                        setManualInput("");
                    }}
                    className={cn(
                      "w-full text-left p-5 rounded-[1.8rem] border transition-all group",
                      selectedId === v.id 
                        ? "bg-blue-500/10 border-blue-500/50" 
                        : "bg-transparent border-white/5 hover:border-white/20"
                    )}
                  >
                     <div className="flex justify-between items-center mb-1">
                        <span className={cn("text-sm font-black transition-colors", selectedId === v.id ? "text-white" : "text-white/60 group-hover:text-white")}>
                           {v.reg}
                        </span>
                        <div className={cn("w-1.5 h-1.5 rounded-full", v.status === 'Active' ? 'bg-blue-500 animate-pulse' : 'bg-orange-500')} />
                     </div>
                     <p className="text-[9px] font-bold text-white/30 truncate uppercase tracking-tighter">{v.model}</p>
                  </button>
               ))}
            </div>
         </div>
      </div>

      {/* MAIN DATA TERMINAL */}
      <div className="flex-1 space-y-10 min-h-[800px]">
         
         {loading ? (
            <div className="h-full flex items-center justify-center bg-black border border-white/10 rounded-[2.5rem] border-dashed p-20">
               <div className="text-center space-y-6">
                  <RefreshCw size={48} className="text-blue-500 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Querying_Registry_API</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] animate-pulse">VAHAN_UPLINK_IN_PROGRESS // ATTEMPT_01</p>
                  </div>
               </div>
            </div>
         ) : error ? (
            <div className="h-full flex items-center justify-center bg-red-500/5 border border-red-500/20 rounded-[2.5rem] border-dashed p-20 text-center">
               <div className="space-y-6">
                  <AlertTriangle size={48} className="text-red-500 mx-auto animate-bounce" />
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Lookup_Failed</h3>
                    <p className="max-w-md mx-auto text-[10px] text-red-500/60 uppercase tracking-[0.4em] leading-relaxed">
                       Vehicle <span className="text-red-500 font-black">{manualInput || selectedId}</span> was not found in the National VAHAN Registry.
                       <br/><br/>
                       The vehicle may not be indexed yet. Try another registration number.
                    </p>
                    <button 
                      onClick={() => fetchRTO(selectedId)}
                      className="mt-8 px-8 py-3 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl hover:bg-red-400 transition-all"
                    >
                      Retry_Link
                    </button>
                  </div>
               </div>
            </div>
         ) : rtoData && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
               {/* HEADER TAC-PAD */}
               <div className="relative bg-black border border-white/10 rounded-[2.5rem] p-10 overflow-hidden mb-10">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-[120px] -mr-40 -mt-40 rounded-full" />
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                     <div>
                        <div className="flex items-center gap-3 mb-6">
                           <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                              Registry_Matched
                           </span>
                           <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                              VERIFIED_RC_AVAIL
                           </span>
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter uppercase mb-2">
                           {rtoData.regNumber}
                        </h1>
                        <p className="text-xl font-bold text-white/40 tracking-tight uppercase">{rtoData.makeModel}</p>
                        <div className="mt-8 flex flex-wrap gap-4">
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Registered_Owner</p>
                              <p className="text-sm font-black text-white uppercase tracking-tighter">{rtoData.ownerName}</p>
                           </div>
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Reg_Date</p>
                              <p className="text-sm font-black text-white uppercase tracking-tighter">{rtoData.regDate}</p>
                           </div>
                           {rtoData.rtoOffice && (
                              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">RTO_Authority</p>
                                 <p className="text-sm font-black text-white uppercase tracking-tighter">{rtoData.rtoOffice}</p>
                              </div>
                           )}
                        </div>
                     </div>
                     
                     <div className="flex flex-wrap gap-4">
                        <TacticalAction label="Export_Fleet_Log" icon={<FileText size={14} />} />
                        <TacticalAction label="Force_Registry_Sync" icon={<RefreshCw size={14} />} color="blue-solid" />
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  
                  {/* COMPLIANCE MODULE */}
                  <div className="bg-black border border-white/10 rounded-[2.5rem] p-10">
                     <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                        <ShieldCheck size={16} className="text-blue-500" /> Compliance_Matrix
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <MetricBlock label="PUC_VALIDITY" value={rtoData.pucExpiry} color="emerald" />
                        <MetricBlock label="INSURANCE_EXPIRY" value={rtoData.insuranceExpiry} color="orange" />
                        <MetricBlock label="FITNESS_DUE" value={rtoData.fitnessExpiry} color="emerald" />
                        <MetricBlock label="TAX_STATUS" value={rtoData.mvTaxExpiry} color="blue" />
                     </div>
                     <div className="mt-10 p-6 bg-white/5 border border-white/5 border-dashed rounded-3xl">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Carrier_Partner</p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{rtoData.insuranceProvider}</p>
                     </div>
                  </div>

                  {/* ENGINEERING SPECS */}
                  <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10">
                     <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                        <Zap size={16} className="text-blue-500" /> Technical_Registry_Uplink
                     </h3>
                     <div className="space-y-6">
                        <TechRow label="CHASSIS_NO" value={rtoData.chassisNumber} />
                        <TechRow label="ENGINE_NO" value={rtoData.engineNumber} />
                        <TechRow label="FUEL_SPEC" value={rtoData.fuelType} />
                        
                        <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase">
                           <span className="text-emerald-500/40 tracking-[0.3em] flex items-center gap-2">
                              <CheckCircle2 size={12} /> SECURE_RECORD_LOCKED
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>

    </div>
  );
}

function MetricBlock({ label, value, color }) {
   return (
      <div className="space-y-3">
         <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{label}</p>
         <div className="flex items-center gap-3">
            <div className={cn(
               "w-3 h-3 rounded-full",
               color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse' : 
               color === 'orange' ? 'bg-orange-500 shadow-[0_0_10px_#f59e0b]' : 
               'bg-blue-500 shadow-[0_0_10px_#3b82f6]'
            )} />
            <span className="text-xl font-black text-white tracking-tighter">{value}</span>
         </div>
      </div>
   );
}

function TechRow({ label, value }) {
   return (
      <div className="flex justify-between items-center bg-black/60 p-6 rounded-[1.5rem] border border-white/5 hover:border-blue-500/20 transition-all">
         <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">{label}</span>
         <span className="text-sm font-black text-white font-mono tracking-tighter">{value}</span>
      </div>
   );
}

function TacticalAction({ label, icon, color }) {
   return (
      <button className={cn(
         "flex items-center gap-3 px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all shadow-lg",
         color === 'blue-solid' 
           ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-blue-500/20"
           : "bg-white/5 border-white/10 text-white/60 hover:border-blue-500 hover:text-white"
      )}>
         {icon} {label}
      </button>
   );
}
