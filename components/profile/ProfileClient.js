"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function ProfileClient() {
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [preferredRouteId, setPreferredRouteId] = useState("");
  const [boardingStop, setBoardingStop] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const [profilePayload, routesPayload] = await Promise.all([
          loadJson("/api/user/profile"),
          loadJson("/api/routes"),
        ]);
        if (!active) return;

        const user = profilePayload?.user;
        if (!user) {
          throw new Error("User data is missing in response");
        }
        
        setProfile(user);
        setRoutes(routesPayload.routes || []);

        const routeValue = user?.studentProfile?.preferredRouteId?._id || user?.studentProfile?.preferredRouteId || "";
        setPreferredRouteId(String(routeValue));
        setBoardingStop(user?.studentProfile?.boardingStop || "");
      } catch (error) {
        if (!active) return;
        setStatus(error.message || "An unknown error occurred");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const selectedRoute = useMemo(
    () => routes.find((route) => String(route._id) === String(preferredRouteId)) || null,
    [routes, preferredRouteId]
  );

  const save = async (event) => {
    event.preventDefault();
    setStatus("");
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredRouteId, boardingStop }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Unable to save profile");
      }
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Secure Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="panel bg-rose-500/5 border-rose-500/20 text-rose-400 p-10 text-center">
        <h2 className="text-xl font-bold mb-2">Profile Load Error</h2>
        <p className="text-sm opacity-80 mb-6">{status || "Unable to retrieve your student information."}</p>
        <button onClick={() => window.location.reload()} className="btn btn-secondary px-6">Retry Connection</button>
      </div>
    );
  }

  const p = profile.studentProfile || {};

  return (
    <section className="panel max-w-3xl page-fade">
      <h2 className="panel-title text-3xl font-black">Student Profile</h2>
      <p className="panel-subtitle text-lg">Maintain your transit preferences and personal details.</p>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/30 p-6 space-y-4 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Full Name</p>
              <p className="font-bold text-white text-lg">{profile.name || "-"}</p>
           </div>
           <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Email Address</p>
              <p className="font-bold text-white text-lg break-all">{profile.email || "-"}</p>
           </div>
           <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Roll ID</p>
              <p className="font-bold text-white text-lg">{p.rollNumber || "Not Set"}</p>
           </div>
           <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Academic Year</p>
              <p className="font-bold text-white text-lg">{p.year ? `${p.year} Year` : "Not Set"}</p>
           </div>
        </div>
      </div>

      <form className="mt-8 space-y-8" onSubmit={save}>
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-400">Preferred Transit Route</label>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-bold">REQUIRED</span>
           </div>
           <select
             className="field h-14 cursor-pointer"
             value={preferredRouteId}
             onChange={(event) => {
               setPreferredRouteId(event.target.value);
               setBoardingStop("");
             }}
           >
             <option value="">Select a route...</option>
             {routes.map((route) => (
               <option key={String(route._id)} value={String(route._id)}>
                 {route.name}
               </option>
             ))}
           </select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-slate-400">Boarding Point Selection</p>
            {selectedRoute && <span className="text-[10px] text-emerald-500 font-bold">{selectedRoute.stops?.length || 0} stops found</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
             {(selectedRoute?.stops || []).map((stop) => (
               <label key={stop.stopId || stop.name || Math.random()} className={cn(
                  "flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer group",
                  boardingStop === stop.name 
                    ? "bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/5" 
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
               )}>
                 <input
                   type="radio"
                   name="boardingStop"
                   className="w-4 h-4 accent-emerald-500"
                   value={stop.name}
                   checked={boardingStop === stop.name}
                   onChange={(event) => setBoardingStop(event.target.value)}
                 />
                 <span className="font-medium group-hover:text-slate-200">{stop.name}</span>
               </label>
             ))}
          </div>
          {(!preferredRouteId) && (
             <div className="p-8 rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 text-center">
                <p className="text-sm text-slate-600 italic">Please select a route above to view available boarding stops.</p>
             </div>
          )}
        </div>

        <button className="btn btn-primary w-full h-14 shadow-xl shadow-emerald-500/10" type="submit" disabled={!preferredRouteId || !boardingStop}>
          Sync Preferences
        </button>
      </form>

      {status ? (
         <div className={cn(
            "mt-8 p-4 rounded-xl text-sm font-bold text-center border animate-in slide-in-from-bottom-2",
            status.toLowerCase().includes("success") || status.toLowerCase().includes("updated") 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
         )}>
            {status}
         </div>
      ) : null}
    </section>
  );
}
