"use client";

import { startTransition, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { ArrowRight, Bus, Activity, User, ShieldAlert, LayoutDashboard } from "lucide-react";
import HeatmapClient from "./HeatmapClient";
import FleetManager from "./FleetManager";
import { cn } from "@/lib/utils/cn";
import { ShieldCheck } from "lucide-react";

export default function AdminClient() {
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [newBusNumber, setNewBusNumber] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [newRouteName, setNewRouteName] = useState("");
  const [direction, setDirection] = useState("Towards College");
  const [departureTime, setDepartureTime] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({});
  const [activeTab, setActiveTab] = useState("fleet");
  const [safetyAlerts, setSafetyAlerts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [boardingEvents, setBoardingEvents] = useState({});

  const load = useCallback(async () => {
    try {
      const [busRes, routeRes, analyticsRes, driverRes] = await Promise.all([
        fetch("/api/admin/buses", { cache: "no-store" }),
        fetch("/api/admin/routes", { cache: "no-store" }),
        fetch("/api/admin/boardings", { cache: "no-store" }),
        fetch("/api/admin/drivers", { cache: "no-store" }),
      ]);
      if (!busRes.ok || !routeRes.ok) {
        throw new Error("Admin APIs are unauthorized. Use an admin/college email.");
      }
      const busPayload = await busRes.json();
      const routePayload = await routeRes.json();
      const analyticsPayload = await analyticsRes.json().catch(() => ({ analytics: {} }));
      const driverPayload = await driverRes.json().catch(() => ({ drivers: [] }));
      const boardingRes = await fetch("/api/admin/metrics/boarding", { cache: "no-store" });
      const boardingPayload = await boardingRes.json().catch(() => ({ boardingByBus: {} }));
      
      setBuses(busPayload.buses || []);
      setRoutes(routePayload.routes || []);
      setAnalytics(analyticsPayload.analytics || {});
      setDrivers(driverPayload?.drivers || []);
      setBoardingEvents(boardingPayload.boardingByBus || {});
      
      if (routePayload.routes?.[0]?._id && !selectedRoute) {
        setSelectedRoute(routePayload.routes[0]._id);
      }
    } catch (err) {
      console.error("[Admin Load Error]", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoute]);

  useEffect(() => {
    let active = true;
    const bootstrap = async () => {
      try {
        await load();
      } catch (error) {
        if (!active) return;
        startTransition(() => {
          setStatus(error.message);
        });
      }
    };
    bootstrap();
    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001");
    
    socket.on("safety:panic", (data) => {
      setSafetyAlerts(prev => [{ ...data, type: "panic", id: Date.now() }, ...prev]);
      new Audio("/alert.mp3").play().catch(() => {});
    });

    socket.on("safety:overspeed", (data) => {
      setSafetyAlerts(prev => [{ ...data, type: "overspeed", id: Date.now() }, ...prev]);
    });

    socket.on("safety:idle", (data) => {
      setSafetyAlerts(prev => [{ ...data, type: "idle", id: Date.now() }, ...prev]);
    });

    socket.on("safety:fatigue", (data) => {
      setSafetyAlerts(prev => [{ ...data, type: "fatigue", id: Date.now() }, ...prev]);
      new Audio("/alert.mp3").play().catch(() => {});
    });

    return () => socket.disconnect();
  }, []);

  const dismissAlert = (id) => {
    setSafetyAlerts(prev => prev.filter(a => a.id !== id));
  };

  const addBus = async (event) => {
    event.preventDefault();
    setStatus("");
    const response = await fetch("/api/admin/buses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        number: newBusNumber, 
        routeId: selectedRoute,
        direction: direction || "Towards College",
        departureTime
      }),
    });
    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.error || "Unable to add bus");
      return;
    }
    setNewBusNumber("");
    setDirection("Towards College");
    setDepartureTime("");
    setStatus("Bus unit deployed successfully.");
    await load();
  };

  const addRoute = async (event) => {
    event.preventDefault();
    setStatus("");
    const response = await fetch("/api/admin/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newRouteName,
        segmentMinutes: 4,
        stops: [
          { id: crypto.randomUUID(), name: "Main Gate", lat: 0, lng: 0 },
          { id: crypto.randomUUID(), name: "Library Square", lat: 0, lng: 0 },
        ],
      }),
    });
    if (!response.ok) {
      const payload = await response.json();
      setStatus(payload.error || "Unable to add route");
      return;
    }
    setNewRouteName("");
    setStatus("Route configuration created.");
    await load();
  };

  const removeBus = async (busId) => {
    setStatus("");
    const response = await fetch(`/api/admin/buses/${busId}`, { method: "DELETE" });
    if (!response.ok) {
      setStatus("Unable to decommission bus");
      return;
    }
    await load();
  };

  const assignDriver = async (busId, driverEmail, driverName) => {
    setStatus(`Assigning ${driverName} to ${busId}...`);
    try {
      const res = await fetch(`/api/admin/buses/${busId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverEmail, driverName }),
      });
      if (res.ok) {
        setStatus(`Driver ${driverName} assigned to ${busId}`);
        await load();
      } else {
        const data = await res.json();
        setStatus(data.error || "Assignment failed");
      }
    } catch (err) {
      setStatus("Error during assignment");
    }
  };

  const syncRag = async () => {
    setStatus("Syncing AI knowledge base...");
    try {
      const res = await fetch("/api/admin/setup-rag", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setStatus(`AI Knowledge synced! Indexed ${data.count} route documents.`);
      } else {
        setStatus("RAG Sync failed.");
      }
    } catch (err) {
      setStatus("Error syncing RAG.");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-3 p-6 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-96 rounded-[2.5rem] bg-white/5 border border-white/10" />)}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 font-mono">
      {/* TACTICAL ALERTS - High Priority Interruptions */}
      <div className="space-y-4">
        {safetyAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={cn(
               "relative overflow-hidden p-6 rounded-[2rem] border-2 shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500",
               alert.type === 'panic' ? 'bg-red-950/90 border-red-500' : 
               alert.type === 'fatigue' ? 'bg-purple-950/90 border-purple-500' : 'bg-orange-950/90 border-orange-500'
            )}
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner",
                alert.type === 'panic' ? 'bg-red-600 animate-pulse' : alert.type === 'fatigue' ? 'bg-purple-600 animate-pulse' : 'bg-orange-600'
              )}>
                {alert.type === 'panic' ? <ShieldAlert size={32} /> : alert.type === 'overspeed' ? <LayoutDashboard size={32} /> : alert.type === 'fatigue' ? <User size={32} /> : <Activity size={32} />}
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tighter uppercase text-white leading-none mb-2">
                   {alert.type === 'panic' ? 'CRITICAL: PANIC_SIGNAL_DETECTED' : alert.type === 'overspeed' ? 'VIOLATION: OVERSPEED_VECTOR' : alert.type === 'fatigue' ? 'BIOMETRIC_WARN: FATIGUE_INDEX' : 'OPERATIONAL: IDLE_TIMEOUT'}
                </h3>
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest">
                  Unit_ID: <span className="text-white underline">{alert.busId}</span> // 
                  {alert.type === 'overspeed' && ` Velocity: ${alert.speed}km/h //`}
                  {alert.type === 'fatigue' && ` EAR: ${alert.ear?.toFixed(2)} //`}
                  {alert.coordinates && ` LatLon: ${alert.coordinates.lat.toFixed(3)},${alert.coordinates.lng.toFixed(3)}`}
                </p>
                {alert.googleMapsLink && (
                  <a href={alert.googleMapsLink} target="_blank" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 hover:text-white mt-3 uppercase tracking-[0.2em] bg-blue-500/20 px-3 py-1 rounded-full transition-all">
                    📍 Map_Uplink_Intercept
                  </a>
                )}
              </div>
            </div>
            <button 
              onClick={() => dismissAlert(alert.id)}
              className="bg-white/10 hover:bg-white text-white hover:text-black px-6 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest border border-white/20"
            >
              Clear_Alert
            </button>
          </div>
        ))}
      </div>

      {/* TOP COMMAND BAR */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/5 border border-white/10 p-4 rounded-[2.5rem] backdrop-blur-md">
         <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
            <TabButton active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} label="Fleet_Logistics" icon={<Bus size={14} />} />
            <TabButton active={activeTab === 'compliance'} onClick={() => setActiveTab('compliance')} label="Fleet_Compliance" icon={<ShieldCheck size={14} />} />
            <TabButton active={activeTab === 'boarding'} onClick={() => setActiveTab('boarding')} label="Boarding_Telemetry" icon={<User size={14} />} color="emerald" />
            <TabButton active={activeTab === 'heatmap'} onClick={() => setActiveTab('heatmap')} label="Demand_Nodes" icon={<Activity size={14} />} color="emerald" />
            <TabButton active={activeTab === 'drivers'} onClick={() => setActiveTab('drivers')} label="Personnel_Index" icon={<User size={14} />} color="amber" />
         </div>

         {status && (
            <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-2xl">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sys_Status: {status}</span>
               <button onClick={syncRag} className="ml-4 px-3 py-1 bg-blue-500 text-white text-[9px] font-black uppercase rounded-lg hover:bg-blue-400 transition-all">
                  Sync_AI_Mesh
               </button>
            </div>
         )}
      </div>
      
      <div className="grid gap-10">
      {activeTab === "fleet" ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          {/* SECTION: REGISTER UNIT */}
          <TechnicalPanel title="Register_Bus_Unit" icon={<Bus className="text-blue-500" />}>
            <form className="space-y-6" onSubmit={addBus}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 block">Plate_Number_ID</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  placeholder="e.g. KA-01-SY-04"
                  value={newBusNumber}
                  onChange={(event) => setNewBusNumber(event.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 block">Tactical_Route_Assignment</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-blue-500 transition-all outline-none appearance-none cursor-pointer"
                  value={selectedRoute}
                  onChange={(event) => setSelectedRoute(event.target.value)}
                >
                  {routes.map((route) => (
                    <option key={route._id} value={route._id} className="bg-slate-900">{route.name}</option>
                  ))}
                  {!routes.length && <option disabled>No routes found</option>}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 block">Vector_Direction</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-blue-500 transition-all outline-none appearance-none"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                  >
                    <option value="Towards College" className="bg-slate-900">TO_CAMPUS</option>
                    <option value="Towards Transit Loop" className="bg-slate-900">TO_LOOP</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 block">Departure_Sync</label>
                  <input
                    type="time"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-blue-500 transition-all outline-none"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:scale-[1.02] active:scale-95" type="submit">
                Initialize_Unit_Deployment
              </button>
            </form>
          </TechnicalPanel>

          {/* SECTION: DEFINE ROUTE */}
          <TechnicalPanel title="Configure_Route_Segments" icon={<Activity className="text-emerald-500" />} accent="emerald">
            <form className="space-y-6" onSubmit={addRoute}>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3 block">Mission_Designation</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
                  placeholder="e.g. ALPHA_EXPRESS"
                  value={newRouteName}
                  onChange={(event) => setNewRouteName(event.target.value)}
                  required
                />
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5 border-dashed text-center">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest leading-relaxed">
                   Manual Stop_Vectoring is locked to System_Supervisors. Default segmentation (4min) applied.
                </p>
              </div>
              <button className="w-full py-5 border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all" type="submit">
                Submit_Route_Configuration
              </button>
            </form>
          </TechnicalPanel>

          {/* SECTION: FLEET STATUS AREA */}
          <div className="technical-panel col-span-full border-t border-white/5 pt-10">
             <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Fleet_Operational_Matrix</h2>
                   <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Grid_Synchronization_Realtime</p>
                </div>
                <div className="flex gap-4">
                   <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-center">
                      <p className="text-[8px] font-bold text-white/30 mb-1">Total_Units</p>
                      <p className="text-lg font-black text-white">{buses.length}</p>
                   </div>
                   <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                      <p className="text-[8px] font-bold text-blue-400 mb-1">Active_Vectors</p>
                      <p className="text-lg font-black text-blue-500">{buses.filter(b => b.status === 'active').length}</p>
                   </div>
                </div>
             </div>

             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {buses.map((bus) => {
                 const stats = analytics[bus.busId] || { total: 0 };
                 return (
                   <div key={bus._id || bus.busId} className="group relative bg-black/40 border border-white/5 hover:border-blue-500/40 rounded-[2rem] p-6 transition-all hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      <div className="flex justify-between items-start mb-6">
                         <div>
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] block mb-1">Unit_ID</span>
                            <h4 className="text-xl font-black text-white font-mono">{bus.busId}</h4>
                         </div>
                         <div className="flex items-center gap-3">
                            <span className={cn(
                               "px-2 py-0.5 rounded-md text-[8px] font-black uppercase border",
                               bus.status === 'active' ? "bg-blue-500/10 border-blue-500/30 text-blue-500" : "bg-red-500/10 border-red-500/30 text-red-500"
                            )}>
                               {bus.status}
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                         </div>
                      </div>

                      <div className="space-y-4 mb-6">
                         <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Current_Route</p>
                            <p className="text-[11px] font-bold text-white/80 truncate">{bus.routeName}</p>
                         </div>

                         <div>
                            <label className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1 block">Personnel_Assignment</label>
                            <select 
                              className="w-full bg-transparent border-b border-white/10 text-[10px] font-black text-blue-400 py-1 cursor-pointer focus:border-blue-500 transition-all outline-none"
                              value={bus.driverEmail || ""}
                              onChange={(e) => {
                                const driver = drivers.find(d => d.email === e.target.value);
                                assignDriver(bus.busId, e.target.value, driver?.name || "Unassigned");
                              }}
                            >
                              <option value="" className="bg-slate-900">NO_OPERATOR</option>
                              {drivers.map(d => (
                                <option key={d.email} value={d.email} className="bg-slate-900" disabled={d.isAssigned && d.email !== bus.driverEmail}>
                                  {d.name?.toUpperCase() || d.email.split('@')[0].toUpperCase()} {d.isAssigned && d.email !== bus.driverEmail ? ' [ASSIGNED]' : ''}
                                </option>
                              ))}
                            </select>
                         </div>

                         <div className="grid grid-cols-2 gap-3 py-4 border-y border-white/5">
                            <div>
                               <p className="text-[8px] font-black text-white/30 uppercase mb-1">Payload</p>
                               <p className="text-lg font-black text-emerald-500 font-mono">{stats.total}<span className="text-[10px] text-white/20 ml-1">PAX</span></p>
                            </div>
                            <div className="text-right">
                               <p className="text-[8px] font-black text-white/30 uppercase mb-1">Departs</p>
                               <p className="text-lg font-black text-white/80 font-mono">{bus.departureTime || "--:--"}</p>
                            </div>
                         </div>
                      </div>

                      <button
                        onClick={() => removeBus(bus.busId)}
                        className="w-full py-3 border border-white/10 hover:border-red-500/50 text-white/20 hover:text-red-500 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        Decommission_Unit
                      </button>
                   </div>
                 )})}
             </div>
          </div>
        </div>
      ) : activeTab === "compliance" ? (
        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
          <FleetManager />
        </div>
      ) : activeTab === "drivers" ? (
        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
          <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Personnel_Index</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Logistics_Force_Telemetry</p>
            </div>
            <div className="text-right">
               <p className="text-[8px] font-black text-white/30 uppercase mb-1">Total_Strength</p>
               <p className="text-2xl font-black text-amber-500 font-mono">{drivers.length}</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drivers.map(driver => (
              <div key={driver._id} className="p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                    {driver.image ? <img src={driver.image} className="w-full h-full object-cover" /> : '👨‍✈️'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-black text-white uppercase text-sm truncate group-hover:text-amber-400 transition-colors">{driver.name}</h3>
                    <p className="text-[10px] text-white/30 font-mono truncate">{driver.email}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <div className={cn("w-1.5 h-1.5 rounded-full", driver.isAssigned ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700')} />
                     <span className={cn("text-[9px] font-black uppercase tracking-widest", driver.isAssigned ? 'text-emerald-500' : 'text-slate-500')}>
                       {driver.isAssigned ? 'Active_Vector' : 'Node_Idle'}
                     </span>
                  </div>
                  <span className="text-[8px] font-bold text-white/20">UPLINK_001</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'boarding' ? (
        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl space-y-10">
           <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-8">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Fleet_Boarding_Manifest</h2>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Grid_Synchronization_Active</p>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-white/30 uppercase mb-1">Total_Boardings_Today</p>
                 <p className="text-2xl font-black text-emerald-500 font-mono">
                    {Object.values(boardingEvents).reduce((sum, bus) => sum + bus.length, 0)}
                 </p>
              </div>
           </div>

           <div className="grid gap-10 lg:grid-cols-2">
              {Object.keys(boardingEvents).length > 0 ? Object.entries(boardingEvents).map(([busId, students]) => (
                <div key={busId} className="bg-black/60 border border-white/10 rounded-[2rem] overflow-hidden">
                   <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Bus size={20} />
                         </div>
                         <h3 className="text-lg font-black text-white">Node {busId}</h3>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase px-3 py-1 bg-emerald-500/10 rounded-lg">{students.length} PAX</span>
                   </div>
                   <div className="p-6">
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                         {students.map((s) => (
                           <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] font-black text-emerald-500">
                                    {s.studentName.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-white">{s.studentName}</p>
                                    <p className="text-[9px] text-white/30 uppercase font-bold tracking-tighter">{s.passType === 'dayPass' ? 'One_Time' : 'Neural_Pass'}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-emerald-400">{s.direction === 'toCollege' ? 'TO_CAMPUS' : 'TO_LOOP'}</p>
                                 <p className="text-[8px] font-bold text-white/20">{new Date(s.timestamp).toLocaleTimeString()}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[3rem]">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Awaiting Primary Grid Scan...</p>
                </div>
              )}
           </div>
        </div>
      ) : activeTab === "heatmap" ? (
        <div className="technical-panel animate-in fade-in duration-1000">
          <HeatmapClient />
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
           {/* Personnel logic exists in the original file at lines 447+ - consolidating it under personnel_index if needed */}
           <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Personnel_Index</h2>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em]">Logistics_Force_Telemetry</p>
            </div>
            <div className="text-right">
               <p className="text-[8px] font-black text-white/30 uppercase mb-1">Total_Strength</p>
               <p className="text-2xl font-black text-amber-500 font-mono">{drivers.length}</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drivers.map(driver => (
              <div key={driver._id} className="p-6 rounded-[2rem] bg-black/40 border border-white/5 hover:border-amber-500/30 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                    {driver.image ? <img src={driver.image} className="w-full h-full object-cover" /> : '👨‍✈️'}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-black text-white uppercase text-sm truncate group-hover:text-amber-400 transition-colors">{driver.name}</h3>
                    <p className="text-[10px] text-white/30 font-mono truncate">{driver.email}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <div className={cn("w-1.5 h-1.5 rounded-full", driver.isAssigned ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700')} />
                     <span className={cn("text-[9px] font-black uppercase tracking-widest", driver.isAssigned ? 'text-emerald-500' : 'text-slate-500')}>
                       {driver.isAssigned ? 'Active_Vector' : 'Node_Idle'}
                     </span>
                  </div>
                  <span className="text-[8px] font-bold text-white/20">UPLINK_001</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

const TechnicalPanel = ({ title, icon, children, className, accent = "blue" }) => (
  <div className={cn(
    "relative overflow-hidden border border-white/5 bg-black/40 backdrop-blur-xl rounded-[2.5rem] p-8 group transition-all",
    accent === "emerald" ? "hover:border-emerald-500/30" : "hover:border-blue-500/30",
    className
  )}>
     <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-30 transition-opacity">
        {icon}
     </div>
     <div className="relative z-10">
        <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
           <span className={cn("w-2 h-2 rounded-full", accent === "emerald" ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-blue-500 shadow-[0_0_8px_#3b82f6]")} />
           {title}
        </h3>
        {children}
     </div>
  </div>
);

const TabButton = ({ active, onClick, label, icon, color = "blue" }) => (
  <button 
    onClick={onClick} 
    className={cn(
      "flex items-center gap-3 py-2.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
      active 
        ? (color === 'emerald' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : color === 'amber' ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]')
        : 'text-white/30 hover:bg-white/5 hover:text-white'
    )}
  >
    {icon} {label}
  </button>
);
