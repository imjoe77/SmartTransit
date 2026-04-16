"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useState } from "react";

// Mock data for the fleet
const fleetData = [
  {
    id: 1,
    regNumber: "MH 12 AB 1234",
    makeModel: "Tata Starbus 40-Seater",
    status: "Active",
    type: "Campus Shuttle",
    documents: {
      pucExpiry: "12 Oct 2026",
      insuranceExpiry: "05 Dec 2026",
      insuranceProvider: "HDFC Ergo General Insurance",
      policyNumber: "POL-9876543210",
      fitnessExpiry: "20 Jan 2027",
      roadTaxExpiry: "Life Time",
    },
    technical: {
      chassisNumber: "MATB4567890123456",
      engineNumber: "ENG987654321",
      fuelType: "Diesel / CNG",
      seatingCapacity: 40,
      yearOfManufacture: 2023,
    },
    assignment: {
      driverName: "Rajesh Kumar",
      driverId: "DRV-1042",
      contact: "+91 98765 43210",
      currentRoute: "North Campus - Main Gate",
    }
  },
  {
    id: 2,
    regNumber: "MH 12 XY 9876",
    makeModel: "Ashok Leyland Falcon",
    status: "Maintenance",
    type: "Staff Bus",
    documents: {
      pucExpiry: "05 Aug 2025",
      insuranceExpiry: "12 Nov 2025",
      insuranceProvider: "ICICI Lombard",
      policyNumber: "POL-11223344",
      fitnessExpiry: "10 Feb 2026",
      roadTaxExpiry: "Life Time",
    },
    technical: {
      chassisNumber: "MALB9876543210987",
      engineNumber: "ENG112233445",
      fuelType: "Diesel",
      seatingCapacity: 52,
      yearOfManufacture: 2022,
    },
    assignment: {
      driverName: "Unassigned",
      driverId: "N/A",
      contact: "N/A",
      currentRoute: "Depot",
    }
  },
  {
    id: 3,
    regNumber: "MH 14 PQ 4567",
    makeModel: "Swaraj Mazda 25-Seater",
    status: "Active",
    type: "Express Shuttle",
    documents: {
      pucExpiry: "20 Sep 2026",
      insuranceExpiry: "15 Jan 2027",
      insuranceProvider: "SBI General Insurance",
      policyNumber: "POL-55667788",
      fitnessExpiry: "01 Mar 2027",
      roadTaxExpiry: "Life Time",
    },
    technical: {
      chassisNumber: "MASM4567890123456",
      engineNumber: "ENG556677889",
      fuelType: "CNG",
      seatingCapacity: 25,
      yearOfManufacture: 2024,
    },
    assignment: {
      driverName: "Sandeep Singh",
      driverId: "DRV-1088",
      contact: "+91 87654 32109",
      currentRoute: "South Campus Express",
    }
  }
];

export default function VehiclePage() {
  const [selectedVehicleId, setSelectedVehicleId] = useState(fleetData[0].id);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFleet = fleetData.filter(v => 
    v.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.makeModel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const vehicle = fleetData.find(v => v.id === selectedVehicleId);

  return (
    <main className="min-h-screen bg-slate-50 antialiased flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-[96rem] mx-auto w-full flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sidebar - Fleet List */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col sticky top-32 bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20 max-h-[calc(100vh-160px)]">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Fleet Directory</h2>
            
            {/* Search Input */}
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search vehicles..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-700"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {filteredFleet.length === 0 ? (
              <p className="text-center text-slate-500 text-sm mt-8">No vehicles found.</p>
            ) : (
              filteredFleet.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border ${
                    selectedVehicleId === v.id 
                      ? "bg-blue-50 border-blue-200 shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800">{v.regNumber}</span>
                    <span className={`w-2.5 h-2.5 rounded-full mt-1.5 ${
                      v.status === 'Active' ? 'bg-emerald-500' : 'bg-orange-500'
                    }`}></span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mb-1.5">{v.makeModel}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-white border border-slate-200 px-2 rounded-md">
                      {v.type}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 pb-10">
          {vehicle ? (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                {/* Decorative background shape */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-10 -mt-20 z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs uppercase tracking-wider">
                      {vehicle.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-semibold text-xs uppercase tracking-wider border ${
                      vehicle.status === 'Active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-orange-50 text-orange-600 border-orange-200'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight flex flex-col gap-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
                      {vehicle.regNumber}
                    </span>
                    <span className="text-xl md:text-2xl text-slate-500 font-semibold">
                      {vehicle.makeModel}
                    </span>
                  </h1>
                </div>
                
                <div className="hidden md:flex gap-4 relative z-10">
                  <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
                    View History
                  </button>
                  <button className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                    Edit Details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Main Info Column */}
                <div className="xl:col-span-2 space-y-8">
                  
                  {/* Documentation & Compliance Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <svg className="w-32 h-32 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3 relative z-10">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      Documentation & Compliance
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 relative z-10">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">PUC Expiry Date</p>
                        <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          {vehicle.documents.pucExpiry}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Insurance Expiry</p>
                        <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                          {vehicle.documents.insuranceExpiry}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Insurance Details</p>
                        <p className="text-base font-semibold text-slate-700">{vehicle.documents.insuranceProvider}</p>
                        <p className="text-sm text-slate-500 font-mono bg-slate-50 py-1 px-2 rounded inline-block mt-1">Ref: {vehicle.documents.policyNumber}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Fitness Certificate Due</p>
                        <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          {vehicle.documents.fitnessExpiry}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Technical Specifications Card */}
                  <div className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xl shadow-slate-200/20">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      Technical Specifications
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Chassis Number</p>
                        <p className="font-mono text-sm font-bold text-slate-800 break-all">{vehicle.technical.chassisNumber}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Engine Number</p>
                        <p className="font-mono text-sm font-bold text-slate-800 break-all">{vehicle.technical.engineNumber}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fuel Type</p>
                        <p className="text-sm font-bold text-slate-800">{vehicle.technical.fuelType}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Capacity</p>
                        <p className="text-sm font-bold text-slate-800">{vehicle.technical.seatingCapacity} Seats</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mfg. Year</p>
                        <p className="text-sm font-bold text-slate-800">{vehicle.technical.yearOfManufacture}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right Sidebar Info */}
                <div className="space-y-8">
                  
                  {/* Quick Actions / Assignment Info */}
                  <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <h3 className="text-lg font-semibold mb-6 text-blue-50">Current Assignment</h3>
                    
                    <div className="space-y-5 relative z-10">
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Assigned Driver</p>
                        <div className="flex items-center gap-3">
                          {vehicle.assignment.driverName !== "Unassigned" ? (
                            <div className="w-10 h-10 rounded-full bg-white/20 flex flex-shrink-0 items-center justify-center font-bold">
                              {vehicle.assignment.driverName.charAt(0)}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-red-400/20 text-red-100 flex items-center justify-center font-bold">
                              !
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-lg leading-tight">{vehicle.assignment.driverName}</p>
                            <p className="text-blue-200 text-sm">{vehicle.assignment.contact}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-px w-full bg-blue-500/50"></div>
                      
                      <div>
                        <p className="text-blue-200 text-sm mb-1">Active Route</p>
                        <p className="font-bold text-xl flex items-center gap-2">
                          <svg className={`w-5 h-5 ${vehicle.status === 'Active' ? 'text-emerald-400' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                          {vehicle.assignment.currentRoute}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Alert Card conditionally rendered */}
                  {vehicle.status === 'Maintenance' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6 shadow-sm flex items-start gap-4">
                      <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shrink-0">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-orange-900 mb-1">In Maintenance</h4>
                        <p className="text-sm text-orange-800/80 mb-3 block">Vehicle is currently out of service for scheduled maintenance.</p>
                        <button className="text-sm font-semibold text-orange-700 bg-orange-200/50 hover:bg-orange-200 px-4 py-2 rounded-lg transition-colors">
                          View Log
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Actions (Hidden on Desktop) */}
                  <div className="flex flex-col md:hidden gap-3 mt-6 pb-6">
                    <button className="w-full py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-sm flex justify-center items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View History
                    </button>
                    <button className="w-full py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md flex justify-center items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Details
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
              <div className="text-center">
                <p className="text-slate-500 font-medium">Select a vehicle from the fleet directory to view details.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer /> 
    </main>
  );
}
