"use client";

import { useState } from "react";

// Mock Data
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
  { 
    id: "TRP-8486", 
    date: "Oct 20, 2026", 
    time: "04:45 PM", 
    route: "East Shuttle", 
    duration: "25m", 
    delay: "None", 
    status: "completed",
    stops: ["Research Park", "Tech Center", "Main Campus"],
    driverRating: "5.0",
  },
];

export default function TripHistory() {
  const [selectedRoute, setSelectedRoute] = useState("All Routes");
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Filter trips for demo purposes
  const filteredTrips = MOCK_TRIPS.filter(trip => 
    selectedRoute === "All Routes" ? true : trip.route.includes(selectedRoute)
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 lg:p-10 font-sans">
      
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
         <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Trip History</h1>
            <p className="text-slate-500 mt-1">Review your past trips, durations, and performance logs.</p>
         </div>
         
         <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Date Range Picker Mock */}
            <div className="w-full sm:w-auto relative">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
               </div>
               <input 
                 type="text" 
                 readOnly 
                 value="Oct 20, 2026 - Oct 25, 2026" 
                 className="block w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium cursor-pointer hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-blue-500/20"
               />
            </div>
            
            {/* Route Dropdown Mock */}
            <div className="w-full sm:w-auto">
               <select 
                 value={selectedRoute}
                 onChange={(e) => setSelectedRoute(e.target.value)}
                 className="block w-full sm:w-48 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium cursor-pointer hover:bg-slate-100 transition-colors outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none"
               >
                  <option>All Routes</option>
                  <option>North Line</option>
                  <option>South Line</option>
                  <option>Express Mall</option>
               </select>
            </div>
         </div>
      </div>

      {/* Responsive Data Container */}
      <div className="overflow-x-auto -mx-6 lg:mx-0 px-6 lg:px-0">
        
        {/* Desktop Table */}
        <table className="w-full min-w-[800px] text-left border-collapse hidden md:table">
           <thead>
             <tr className="border-b border-slate-100">
               <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Trip / Date</th>
               <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Route</th>
               <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Duration</th>
               <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase">Status</th>
               <th className="py-4 px-4 text-xs font-bold text-slate-400 tracking-wider uppercase text-right">Action</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group">
                   <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{trip.id}</div>
                      <div className="text-sm font-medium text-slate-500">{trip.date} • {trip.time}</div>
                   </td>
                   <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${trip.route.includes('North') ? 'bg-blue-500' : trip.route.includes('South') ? 'bg-indigo-500' : 'bg-green-500'}`}></div>
                        <span className="font-semibold text-slate-700">{trip.route}</span>
                      </div>
                   </td>
                   <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{trip.duration}</div>
                      <div className={`text-xs font-bold ${trip.delay === 'None' ? 'text-slate-400' : trip.delay === '--' ? 'text-slate-300' : 'text-amber-500'}`}>
                         Delay: {trip.delay}
                      </div>
                   </td>
                   <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border
                        ${trip.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200/50' : 'bg-red-50 text-red-700 border-red-200/50'}`}
                      >
                         <div className={`w-1.5 h-1.5 rounded-full ${trip.status === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                         {trip.status.toUpperCase()}
                      </span>
                   </td>
                   <td className="py-4 px-4 text-right">
                      <button 
                         onClick={() => setSelectedTrip(trip)}
                         className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-transparent shadow-sm"
                      >
                         View Details
                      </button>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredTrips.map((trip) => (
             <div key={trip.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <div className="font-bold text-slate-900">{trip.id}</div>
                     <div className="text-xs font-medium text-slate-500">{trip.date} • {trip.time}</div>
                   </div>
                   <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase
                        ${trip.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {trip.status}
                   </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                   <div>
                     <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Route</p>
                     <p className="font-semibold text-slate-800">{trip.route}</p>
                   </div>
                   <div>
                     <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Duration</p>
                     <p className="font-semibold text-slate-800">{trip.duration}</p>
                   </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => setSelectedTrip(trip)}
                    className="w-full py-2.5 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-colors"
                  >
                    View Details
                  </button>
                </div>
             </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTrips.length === 0 && (
           <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                 <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                 </svg>
              </div>
              <h3 className="text-slate-900 font-bold text-lg mb-1">No trips found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your filters to see more history.</p>
           </div>
        )}

      </div>

      {/* Pagination component mock */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
         <p className="text-sm font-medium text-slate-500">Showing <span className="font-bold text-slate-900">{filteredTrips.length}</span> results</p>
         <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-900 flex items-center justify-center text-white font-bold shadow-md">
               1
            </button>
            <button className="hidden sm:flex w-10 h-10 rounded-xl border border-slate-200 items-center justify-center text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
               2
            </button>
            <button className="hidden sm:flex w-10 h-10 rounded-xl border border-slate-200 items-center justify-center text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
               3
            </button>
            <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
         </div>
      </div>

      {/* Trip Details Modal Overlayer */}
      {selectedTrip && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-900/40 transition-opacity">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-[slideUp_0.3s_ease-out]">
               
               {/* Modal Header */}
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div>
                   <h2 className="text-xl font-bold text-slate-900">Trip Details</h2>
                   <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">{selectedTrip.id}</p>
                 </div>
                 <button 
                   onClick={() => setSelectedTrip(null)}
                   className="p-2 bg-white rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                 >
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
               </div>

               {/* Modal Body */}
               <div className="flex-1 overflow-y-auto p-6 font-sans">
                 
                 {/* Top Metric Cards */}
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                      <p className="font-semibold text-slate-800">{selectedTrip.date}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Duration</p>
                      <p className="font-semibold text-slate-800">{selectedTrip.duration}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Delay</p>
                      <p className={`font-bold ${selectedTrip.delay !== 'None' && selectedTrip.delay !== '--' ? 'text-amber-500' : 'text-slate-800'}`}>{selectedTrip.delay}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                      <p className={`font-semibold capitalize ${selectedTrip.status === 'completed' ? 'text-green-600' : 'text-red-500'}`}>{selectedTrip.status}</p>
                    </div>
                 </div>

                 {/* Map Placeholder */}
                 <div className="w-full h-48 bg-slate-900 rounded-2xl mb-8 relative overflow-hidden border border-slate-200 flex items-center justify-center">
                    <div 
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 grayscale contrast-125 mix-blend-overlay"
                      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-blue-900/60"></div>
                    
                    {/* Mock route line */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
                       <div className="w-full h-1 bg-white/20 rounded-full relative">
                         <div className="absolute top-1/2 left-0 w-3 h-3 bg-white rounded-full -mt-1.5 ring-4 ring-slate-900"></div>
                         <div className="absolute top-1/2 right-0 w-3 h-3 bg-blue-500 rounded-full -mt-1.5 ring-4 ring-white"></div>
                       </div>
                    </div>
                 </div>

                 {/* Stops Timeline */}
                 <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       Stops Covered ({selectedTrip.stops.length})
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
                       {selectedTrip.stops.map((stop, i) => (
                         <div key={i} className="relative flex items-center gap-4 group">
                           <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-slate-300 ring-4 ring-white z-10 transition-colors group-hover:border-blue-500">
                             <div className="w-1.5 h-1.5 bg-slate-300 rounded-full group-hover:bg-blue-500 transition-colors"></div>
                           </div>
                           <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 flex-1 shadow-sm">
                              <h4 className="font-bold text-slate-700 text-sm">{stop}</h4>
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>

               </div>
               
               {/* Modal Footer */}
               <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-3xl">
                  <button 
                    onClick={() => setSelectedTrip(null)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors shadow-sm"
                  >
                    Close
                  </button>
                  <button className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 border border-slate-900 rounded-xl transition-colors shadow-md">
                    Export Report
                  </button>
               </div>
            </div>
         </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
