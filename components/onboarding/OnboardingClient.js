"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";

const departments = ["CSE", "ECE", "ME", "CIVIL", "MBA"];

async function loadJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed: ${response.status} - ${text}`);
  }
  return response.json();
}

export default function OnboardingClient() {
  const [step, setStep] = useState(1);
  const [routes, setRoutes] = useState([]);
  const [rollNumber, setRollNumber] = useState("");
  const [department, setDepartment] = useState("CSE");
  const [year, setYear] = useState(1);
  const [preferredRouteId, setPreferredRouteId] = useState("");
  const [boardingStop, setBoardingStop] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const payload = await loadJson("/api/routes");
        if (!mounted) return;
        const nextRoutes = payload.routes || [];
        setRoutes(nextRoutes);
        if (nextRoutes[0]) {
          setPreferredRouteId(String(nextRoutes[0]._id));
        }
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message);
      }
    };

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedRoute = useMemo(
    () => routes.find((route) => String(route._id) === String(preferredRouteId)),
    [routes, preferredRouteId]
  );

const submit = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("[Onboarding] Submitting with:", { rollNumber, department, year, preferredRouteId, boardingStop });
      
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNumber,
          department,
          year: Number(year),
          preferredRouteId,
          boardingStop,
        }),
      });
      
      console.log("[Onboarding] Profile response status:", response.status);
      
      if (!response.ok) {
        const payload = await response.json();
        console.error("[Onboarding] Profile error payload:", payload);
        throw new Error(payload.error || "Unable to save profile");
      }
      
      const payload = await response.json();
      console.log("[Onboarding] Profile saved successfully:", payload);
      
      window.location.href = "/tracking";
    } catch (submitError) {
      console.error("[Onboarding] Submit error:", submitError);
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel max-w-4xl mx-auto page-fade">
      <h2 className="panel-title flex items-center gap-2">
        <User className="text-emerald-400" size={24} />
        Student Onboarding
      </h2>
      <p className="panel-subtitle">Complete your profile to unlock live tracking.</p>

      {error ? (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <p className="text-sm font-medium text-rose-400">{error}</p>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-8 space-y-4 animate-in">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Academic Info</label>
            <input
              className="field"
              placeholder="Roll Number (e.g. 2024CS001)"
              value={rollNumber}
              onChange={(event) => setRollNumber(event.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <select className="field" value={department} onChange={(event) => setDepartment(event.target.value)}>
                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item} Dept
                  </option>
                ))}
              </select>
              <select className="field" value={year} onChange={(event) => setYear(Number(event.target.value))}>
                {[1, 2, 3, 4].map((item) => (
                  <option key={item} value={item}>
                    Year {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary w-full" onClick={() => setStep(2)} type="button" disabled={!rollNumber}>
            Continue to Route Selection
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8 animate-in">
          <h3 className="text-lg font-bold text-white mb-4">Choose Preferred Route</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {routes.map((route) => (
              <button
                key={route._id}
                type="button"
                className={`bus-card text-left group ${String(preferredRouteId) === String(route._id) ? "ring-2 ring-emerald-500 bg-emerald-500/5 border-emerald-500/30" : ""}`}
                onClick={() => {
                  setPreferredRouteId(String(route._id));
                  setBoardingStop("");
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{route.name}</p>
                  {String(preferredRouteId) === String(route._id) && (
                    <span className="tag tag-blue bg-emerald-500/20 text-emerald-400">Selected</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">Stops: {(route.stops || []).map((stop) => stop.name).join(", ")}</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  {(route.assignedBuses || []).length} Active Buses
                </div>
              </button>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={() => setStep(1)} type="button">
              Back
            </button>
            <button className="btn btn-primary flex-[2]" onClick={() => setStep(3)} type="button" disabled={!preferredRouteId}>
              Continue to Boarding Stop
            </button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-8 animate-in">
          <h3 className="text-lg font-bold text-white mb-4">Choose Boarding Stop</h3>
          <div className="grid gap-2">
            {(selectedRoute?.stops || []).map((stop) => (
              <label 
                key={stop.stopId || stop.name} 
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${boardingStop === stop.name ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"}`}
              >
                <input
                  type="radio"
                  name="boardingStop"
                  className="w-4 h-4 accent-emerald-500"
                  value={stop.name}
                  checked={boardingStop === stop.name}
                  onChange={(event) => setBoardingStop(event.target.value)}
                />
                <span className="font-medium">{stop.name}</span>
              </label>
            ))}
          </div>
          <div className="mt-8 flex gap-3">
            <button className="btn btn-secondary flex-1" onClick={() => setStep(2)} type="button">
              Back
            </button>
            <button className="btn btn-primary flex-[2]" onClick={submit} type="button" disabled={!boardingStop || loading}>
              {loading ? "Completing Profile..." : "Finish Onboarding"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
