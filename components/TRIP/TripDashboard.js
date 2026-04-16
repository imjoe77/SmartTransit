"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TripDashboard() {
  const [position, setPosition] = useState(40); // Initial position %
  const [isPaused, setIsPaused] = useState(false);

  const stops = [
    { id: 1, name: "North Campus Terminal", time: "08:00 AM", status: "completed" },
    { id: 2, name: "Engineering Block", time: "08:12 AM", status: "completed" },
    { id: 3, name: "Main Library", time: "08:25 AM", status: "current", eta: "2 min" },
    { id: 4, name: "Student Union", time: "08:40 AM", status: "upcoming" },
    { id: 5, name: "South Campus Station", time: "09:00 AM", status: "upcoming" },
  ];

  // Simulating bus movement
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev >= 100) return 0; // loop back for demo
        return prev + 0.1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="flex flex-col h-[80vh] min-h-[700px] bg-white overflow-hidden font-sans rounded-3xl shadow-2xl border border-slate-200/60 ring-1 ring-slate-900/5">
      
      {/* Top Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Link href="/driver" className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
             </svg>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Bus 4B</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${isPaused ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'} border ${isPaused ? 'border-amber-200' : 'border-green-200'}`}>
                {isPaused ? 'PAUSED' : 'IN TRANSIT'}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-0.5">North Line • Route #8482</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           {/* Connection Status */}
           <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className={`relative flex h-2.5 w-2.5`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
              </span>
              GPS Active
           </div>
           
           <div className="w-10 h-10 rounded-full border-2 border-slate-200 overflow-hidden shadow-sm">
             <img src="https://images.unsplash.com/photo-1543165365-07232ed12fad?q=80&w=150&auto=format&fit=crop" alt="Driver" className="w-full h-full object-cover" />
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Map Area */}
        <div className="flex-1 relative bg-slate-900 flex flex-col min-h-[40vh] lg:min-h-0">
           {/* Map Background (Styled for Dashboard) */}
           <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60 grayscale contrast-125 mix-blend-overlay"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=2000&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-blue-900/40"></div>

          {/* Route Overlay (Mock) */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-40 pointer-events-none">
             <svg className="w-full h-full" preserveAspectRatio="none">
               <path 
                d="M 0,80 Q 200,20 400,80 T 800,80 T 1200,80 T 1600,80 T 2000,80" 
                fill="none" 
                stroke="rgba(255,255,255,0.15)" strokeWidth="6" strokeDasharray="10 10"
              />
               <path 
                d="M 0,80 Q 200,20 400,80 T 800,80 T 1200,80 T 1600,80 T 2000,80" 
                fill="none" 
                stroke="rgba(59, 130, 246, 0.4)" strokeWidth="3"
              />
             </svg>
          </div>

          {/* Stop Markers on Map */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-full pointer-events-none">
            {[10, 30, 50, 75, 95].map((pos, i) => {
                const isPassed = position > pos;
                const isCurrent = Math.abs(position - pos) < 5;
                return (
                  <div key={i} className="absolute top-1/2 -mt-3.5" style={{ left: `${pos}%` }}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border-4 shadow-lg transition-colors duration-500
                       ${isPassed ? 'bg-blue-500 border-white text-white' : 'bg-white border-slate-300 text-slate-400'}`}>
                       {isPassed && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </div>
                )
            })}
          </div>

          {/* Live Bus Marker */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-100 ease-linear"
            style={{ left: `calc(${position}% + 32px)`, marginTop: `${Math.sin(position / 10) * 12}px` }} 
          >
            <div className="relative flex items-center justify-center -ml-6 -mt-6">
              {!isPaused && <div className="absolute w-20 h-20 bg-blue-500/20 rounded-full animate-ping"></div>}
              <div className="absolute w-14 h-14 bg-white/20 rounded-full backdrop-blur-sm"></div>
              
              <div className="relative w-10 h-10 bg-white rounded-xl shadow-2xl flex items-center justify-center border-2 border-blue-500 text-blue-600 custom-shadow">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
              </div>

               {/* Speed Pill */}
              <div className="absolute -top-10 bg-slate-900 border border-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-md">
                {isPaused ? "0 mph" : "32 mph"}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-b border-r border-slate-700 rotate-45"></div>
              </div>
            </div>
          </div>

          {/* Map Overlay Stats */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl shadow-xl">
               <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">Next Stop ETA</p>
               <p className="text-3xl font-extrabold text-white flex items-baseline gap-2">
                 {isPaused ? "--" : "2"} <span className="text-lg text-slate-400 font-medium">min</span>
               </p>
            </div>
          </div>

        </div>

        {/* Sidebar Panel */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col z-20 shadow-[-10px_0_20px_rgba(0,0,0,0.03)] relative h-[50vh] lg:h-auto z-10 transition-all rounded-t-3xl lg:rounded-none -mt-6 lg:mt-0 pt-2 lg:pt-0">
           
           {/* Mobile Handle */}
           <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 lg:hidden"></div>

           {/* Progress Overview */}
           <div className="px-6 pb-6 pt-2 lg:pt-8 border-b border-slate-100">
             <div className="flex justify-between items-end mb-3">
               <div>
                 <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Trip Progress</h3>
                 <p className="text-slate-500 text-xs mt-1">40% completed • 2 stops left</p>
               </div>
               <div className="text-right">
                 <span className="text-xl font-extrabold text-blue-600">40%</span>
               </div>
             </div>
             <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 inset-shadow">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isPaused ? 'bg-amber-500' : 'bg-blue-500 relative'}`} 
                  style={{ width: `${position}%` }}
                >
                  {!isPaused && <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>}
                </div>
             </div>
           </div>

           {/* Stops List */}
           <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Route Stops</h3>
              
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-10">
                 {stops.map((stop, index) => {
                    const isCompleted = stop.status === "completed";
                    const isCurrent = stop.status === "current";
                    
                    return (
                      <div key={stop.id} className="relative pl-8 group">
                         {/* Timeline Dot */}
                         <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 outline outline-4 outline-white flex items-center justify-center transition-colors
                            ${isCompleted ? 'bg-green-500 border-green-500' : 
                              isCurrent ? 'bg-blue-600 border-blue-100 animate-pulse-border' : 
                              'bg-white border-slate-300'}`}
                          >
                           {isCompleted && (
                             <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                             </svg>
                           )}
                           {isCurrent && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                           )}
                         </div>
                         
                         {/* Stop Details */}
                         <div>
                            <div className="flex justify-between items-start mb-0.5">
                              <h4 className={`text-base font-bold ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-500'}`}>
                                {stop.name}
                              </h4>
                              <span className={`text-xs font-medium ${isCompleted ? 'text-slate-400' : 'text-slate-600 bg-slate-100 px-2 py-0.5 rounded'}`}>
                                {stop.time}
                              </span>
                            </div>
                            
                            {isCurrent && (
                               <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-blue-700">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm font-semibold">ETA: {stop.eta}</span>
                                  </div>
                                  <button className="text-xs font-bold bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md hover:bg-blue-600 hover:text-white transition-colors shadow-sm">
                                    Arrived
                                  </button>
                               </div>
                            )}
                         </div>
                      </div>
                    )
                 })}
              </div>
           </div>

           {/* Action Controls */}
           <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {isPaused ? (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    Resume Trip
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    Pause Trip
                  </>
                )}
              </button>
              
              <button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" /></svg>
                End Trip
              </button>
           </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
        .animate-pulse-border {
          box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
          animation: pulse-ring 2s infinite;
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
