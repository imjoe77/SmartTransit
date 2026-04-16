"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function DriverDetails() {
  const [routeStatus, setRouteStatus] = useState("On Route - Approaching Station A");
  const [eta, setEta] = useState("5 min");
  
  // Mock dynamic route changes
  useEffect(() => {
    const statuses = [
      { status: "On Route - Approaching North Campus", eta: "4 min" },
      { status: "On Route - Arriving at North Campus", eta: "1 min" },
      { status: "At Station - Boarding", eta: "Now" },
      { status: "On Route - Approaching South Campus", eta: "8 min" },
    ];
    
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % statuses.length;
      setRouteStatus(statuses[currentIndex].status);
      setEta(statuses[currentIndex].eta);
    }, 5000); // Change status every 5 seconds for demonstration
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden pt-36">
      {/* High-Impact Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&auto=format&fit=crop&q=80" 
          alt="Transit Background" 
          className="w-full h-full object-cover opacity-10 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950" />
      </div>

      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-sm font-bold tracking-widest text-blue-400 uppercase mb-2">Driver Profile</h2>
          <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Live Status & Info</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/5 flex flex-col md:flex-row gap-8 items-center h-full group/main shadow-blue-500/5">
              
              {/* Left Side: Driver Photo */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 group">
                <div className="absolute inset-0 bg-blue-500 rounded-3xl rotate-3 scale-105 group-hover:rotate-6 transition-transform duration-300 opacity-20"></div>
                <div className="absolute inset-0 bg-indigo-500 rounded-3xl -rotate-3 scale-105 group-hover:-rotate-6 transition-transform duration-300 opacity-20"></div>
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl z-10 border-2 border-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1543165365-07232ed12fad?q=80&w=400&auto=format&fit=crop"
                    alt="Driver profile"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {/* Live Indicator */}
                <div className="absolute -bottom-2 -right-2 z-20 flex bg-slate-900 p-1 rounded-full shadow-lg border border-slate-800">
                  <div className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      ON DUTY
                  </div>
                </div>
              </div>

              {/* Right Side: Details */}
              <div className="flex-1 w-full flex flex-col gap-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-3xl font-extrabold text-white flex items-center gap-2">
                    Marcus Johnson
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </h3>
                  <p className="text-slate-400 font-medium tracking-wide">Driver ID: <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-sm border border-blue-500/20">#MJ-8482</span></p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-blue-500/10 transition-colors group/stat">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-inner text-blue-400 group-hover/stat:scale-110 transition-transform border border-white/5">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Age</p>
                      <p className="text-lg font-bold text-white leading-tight">42 Years</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-blue-500/10 transition-colors group/stat">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-inner text-indigo-400 group-hover/stat:scale-110 transition-transform border border-white/5">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m-6 8a9 9 0 110-18 9 9 0 010 18z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Experience</p>
                      <p className="text-lg font-bold text-white leading-tight">12+ Yrs</p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-blue-500/10 transition-colors group/stat">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-inner text-yellow-400 group-hover/stat:scale-110 transition-transform border border-white/5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Assigned Bus</p>
                      <p className="text-lg font-bold text-white leading-tight">Bus <span className="text-yellow-400">4B</span></p>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 flex items-center gap-4 hover:bg-blue-500/10 transition-colors group/stat">
                    <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-inner text-green-400 group-hover/stat:scale-110 transition-transform border border-white/5">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Assigned Route</p>
                      <p className="text-lg font-bold text-white leading-tight">North Line</p>
                    </div>
                  </div>
                </div>

                {/* Dynamic Live Status Box */}
                <div className="mt-2 bg-slate-950/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/5 relative overflow-hidden group/status">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mt-10 -mr-10 transition-transform duration-700 group-hover/status:scale-150"></div>
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                          <p className="text-blue-400/60 font-medium text-xs uppercase tracking-[0.2em]">Live Tracking</p>
                          <p className="text-white font-bold text-xl">{routeStatus}</p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/10 text-center min-w-[100px]">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Approximated ETA</p>
                        <p className="text-2xl font-black text-blue-400">{eta}</p>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Container */}
          <div className="lg:col-span-1 space-y-8">
            {/* Performance Metrics */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/5 shadow-blue-500/5">
              <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/10 shadow-inner">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
                Efficiency Profile
              </h4>
              
              <div className="space-y-6">
                {/* On-Time Arrival */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-semibold text-slate-400">On-Time Precision</p>
                    <p className="text-sm font-bold text-blue-400">98%</p>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '98%' }}></div>
                  </div>
                </div>

                {/* Safety Score */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-semibold text-slate-400">Safety Index</p>
                    <p className="text-sm font-bold text-emerald-400">4.9/5.0</p>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Fuel Efficiency */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-semibold text-slate-400">Energy Efficiency</p>
                    <p className="text-sm font-bold text-indigo-400">A+</p>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shift Calendar / Next Duty */}
            <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border border-white/5 text-white relative overflow-hidden group/shift">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mb-10 -mr-10"></div>
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-white/5 text-blue-400 flex items-center justify-center border border-white/10">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                Duty Schedule
              </h4>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 group-hover/shift:border-blue-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Today</p>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">LIVE</span>
                  </div>
                  <p className="text-lg font-bold">08:00 AM - 04:00 PM</p>
                  <p className="text-sm text-slate-500 font-medium">Route: North Campus Loop</p>
                </div>

                <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/5 opacity-60">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Tomorrow</p>
                  <p className="text-lg font-bold text-slate-400">09:30 AM - 05:30 PM</p>
                  <p className="text-sm text-slate-600 font-medium">Route: South Express</p>
                </div>
              </div>

              <button className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl font-bold text-sm shadow-xl shadow-blue-600/20 hover:-translate-y-1 active:scale-95">
                View Operational Roster
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

  );
}