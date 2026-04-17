"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { 
  Bot, MapPinned, Navigation2, Route as RouteIcon, User, 
  Settings, LogOut, CheckCircle, Smartphone, Camera, 
  Loader2, CreditCard, Ticket, ShieldCheck, ChevronRight,
  ChevronLeft, AlertCircle, Scan, History, Heart, Activity,
  Timer, MapPin, LogIn, BusFront, Upload, FileUp
} from "lucide-react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { cn } from "@/lib/utils/cn";

function hashText(value) {
  const text = `${value || ""}`;
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export default function BoardingFlowClient({ session }) {
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [passType, setPassType] = useState(""); 
  const [boardingStatus, setBoardingStatus] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeStr, setTimeStr] = useState("00:00 AM");

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    let active = true;
    const fetchContext = async () => {
      try {
        const [profileRes, routeRes, busRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/routes"),
          fetch("/api/buses")
        ]);
        const profileData = await profileRes.json();
        const routeData = await routeRes.json();
        const busData = await busRes.json();
        if (active) {
          setProfile(profileData.user || null);
          setRoutes(routeData.routes || []);
          setBuses(busData.buses || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (active) setIsLoading(false);
      }
    };
    fetchContext();
    return () => { active = false; };
  }, []);

  const preferredRouteId = profile?.studentProfile?.preferredRouteId?._id || profile?.studentProfile?.preferredRouteId;
  
  const assignedBus = useMemo(() => {
    if (!profile || !routes.length || !buses.length || !preferredRouteId) return null;
    const myRoute = routes.find(r => String(r._id) === String(preferredRouteId));
    if (!myRoute) return null;
    const myRouteBuses = buses.filter(b => String(b.routeId) === String(myRoute._id));
    if (!myRouteBuses.length) return null;
    return myRouteBuses[hashText(profile._id || profile.email || "") % myRouteBuses.length] || null;
  }, [buses, routes, profile, preferredRouteId]);

  const confirmBoarding = async (paymentId = "") => {
    if (!assignedBus?.busId) return;
    try {
      setBoardingStatus({ type: "info", msg: "Authenticating..." });
      const res = await fetch("/api/boarding/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: assignedBus.busId,
          declaredPassType: passType,
          paymentId: paymentId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Boarding failed");
      
      setBoardingStatus({ 
        type: "success", 
        msg: `SYNC SUCCESS: Unit ${assignedBus.busId} Boarded.`
      });
    } catch (err) {
      setBoardingStatus({ type: "error", msg: err.message });
    }
  };

  useEffect(() => {
    if (!isScanning || passType !== "dayPass") return;
    
    // Switch to headless Html5Qrcode to avoid clientWidth/DOM calculation errors
    const html5QrCode = new Html5Qrcode("reader");
    let isStarted = false;

    const startScanner = async () => {
      try {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        await html5QrCode.start(
          { facingMode: "environment" }, 
          config,
          (decodedText) => {
            html5QrCode.stop().then(() => {
              setIsScanning(false);
              handleDayPassBoarding(decodedText);
            }).catch(() => {});
          },
          () => {} // silent feedback
        );
        isStarted = true;
      } catch (err) {
        console.error("Scanner failed:", err);
      }
    };

    startScanner();

    return () => { 
      if (isStarted) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [isScanning, passType]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBoardingStatus({ type: "info", msg: "Decoding File Node..." });
      const html5QrCode = new Html5Qrcode("qr-file-processor");
      const decodedText = await html5QrCode.scanFile(file, false); // Headless scan to avoid clientWidth issues
      handleDayPassBoarding(decodedText);
    } catch (err) {
      setBoardingStatus({ type: "error", msg: "Invalid QR Signal: Unable to decode file node." });
    }
  };

  const handleDayPassBoarding = async (scannedBusId) => {
    try {
      setBoardingStatus({ type: "info", msg: "Linking payment..." });
      const orderRes = await fetch("/api/boarding/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId: scannedBusId }),
      });
      if (!orderRes.ok) throw new Error("Link failed.");
      const { order } = await orderRes.json();
      const paymentData = await new Promise((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
          amount: order.amount,
          currency: order.currency,
          name: "CampusRide Day Pass",
          description: `Boarding Bus ${scannedBusId}`,
          order_id: order.id,
          handler: function (response) { resolve(response); },
          prefill: {
            name: session?.user?.name || "Student User",
            email: session?.user?.email || "student@example.com",
            method: "upi" 
          },
          config: {
            display: {
              blocks: {
                payment: {
                  name: 'Authentication Node',
                  instruments: [
                    {
                      method: 'upi',
                      protocols: ['vpa'] // Strictly force UPI ID input
                    }
                  ]
                }
              },
              sequence: ['block.payment'],
              preferences: {
                show_default_blocks: false
              }
            }
          },
          theme: {
            color: "#10b981"
          },
          modal: { ondismiss: function () { reject(new Error("Cancelled")); } },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      });
      setBoardingStatus({ type: "info", msg: "Boarding..." });
      const scanRes = await fetch("/api/boarding/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: scannedBusId,
          declaredPassType: "dayPass",
          paymentId: paymentData?.razorpay_payment_id || "",
          ...(paymentData || {}),
        }),
      });
      const out = await scanRes.json();
      if (!scanRes.ok) throw new Error(out.error || "Failed.");
      setBoardingStatus({ type: "success", msg: `Payment verified. Unit ${scannedBusId} boarded.` });
    } catch (err) {
      setBoardingStatus({ type: "error", msg: err.message });
    }
  };

  return (
    <div className="h-screen w-screen bg-[#dee2e6] flex overflow-hidden font-sans text-slate-800 pb-20 lg:pb-0">

      {/* === DARK SIDEBAR === */}
      <div className="w-72 hidden lg:flex flex-col bg-[#1a1c23] border-r border-[#2d2f39] shrink-0 text-slate-300 shadow-2xl z-20">
        <div className="h-20 flex items-center px-8 shrink-0 border-b border-[#2d2f39]">
           <Link href="/" className="font-black text-2xl text-white flex items-center gap-3 tracking-tighter hover:opacity-80 transition-opacity">
             <div className="text-emerald-500"><Bot size={28} /></div>
             SmartTransit
           </Link>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
           <div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Access Grid</p>
             <div className="space-y-1">
                <SideItem icon={<MapPinned size={18} />} label="Live Tracking" href="/tracking" />
                <SideItem icon={<Navigation2 size={18} />} label="Trip Planner" href="/route" />
                <SideItem icon={<Scan size={18} />} label="Boarding Mode" href="/tracking/boarding" active />
                <SideItem icon={<RouteIcon size={18} />} label="AI Console" href="/chat" />
                <SideItem icon={<User size={18} />} label="My Profile" href="/profile" />
             </div>
           </div>
        </div>

        <div className="p-6 shrink-0 border-t border-[#2d2f39]">
           {session?.user ? (
             <div className="flex items-center gap-3 bg-[#2d2f39] p-3 rounded-xl border border-[#3d404d]">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 overflow-hidden">
                  {profile?.image ? (
                    <img src={profile.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.[0] || session.user.name?.[0] || "U"
                  )}
                </div>
                <div className="flex-1 truncate">
                   <p className="text-xs font-black text-white leading-none mb-1">{profile?.name || session.user.name}</p>
                   <Link href="/api/auth/signout?callbackUrl=/" className="text-[9px] font-black text-slate-500 uppercase hover:text-emerald-500">Log Out</Link>
                </div>
             </div>
           ) : (
             <Link href="/login" className="w-full bg-emerald-500 text-slate-900 py-3 rounded-lg text-[10px] font-black uppercase text-center">Login</Link>
           )}
        </div>
      </div>

      {/* === MAIN CONSOLE AREA === */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#dee2e6]">
        
        {/* Console Header */}
        <div className="h-20 flex justify-between items-center px-6 md:px-10 border-b border-[#cbd5e0] shrink-0 bg-[#dee2e6]/50 backdrop-blur-md z-10 transition-all">
          <div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter">Digital Boarding</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Authentication Unit — {timeStr}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 bg-[#cbd5e0] px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-slate-400/30 text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest transition-all">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Sec_Link Active
          </div>
        </div>

        {/* Console Workspace */}
        <div className="flex-1 overflow-y-auto p-5 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
          
          <div className="max-w-4xl mx-auto space-y-8 pb-10">
            
            {/* Status Card */}
            <div className="bg-[#cbd5e0] border-2 border-slate-400 rounded-3xl p-6 md:p-8 shadow-inner flex flex-row items-center gap-5 md:gap-8 relative overflow-hidden group transition-all">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-[#dee2e6] border border-slate-400 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                   <BusFront className="text-slate-600" size={24} />
                </div>
                {isLoading ? (
                  <div className="flex-1 flex items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-xs">
                    <Loader2 className="animate-spin" size={16} /> Scanning nodes...
                  </div>
                ) : !assignedBus ? (
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">No Active Assignment</h3>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Awaiting Vehicle Signal</p>
                  </div>
                ) : (
                  <div className="flex-1">
                     <p className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1">Assigned Vehicle</p>
                     <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter mb-1">Node {assignedBus.busId}</h2>
                     <p className="text-slate-600 font-bold text-[9px] md:text-[11px] uppercase tracking-widest flex items-center gap-2">
                       <MapPin size={12} className="text-slate-400" /> Route {profile?.studentProfile?.preferredRouteId?.routeNumber} Synced
                     </p>
                  </div>
                )}
                {/* Visual Flair */}
                <BusFront className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] text-slate-900 rotate-12" />
            </div>

            {/* Core Interaction Unit - THE BORDERED CONTAINER */}
            <div className="bg-[#dee2e6] border-2 md:border-4 border-slate-400/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative">
               
               {/* Interior shading for depth */}
               <div className="absolute inset-0 bg-[#cbd5e0]/20 pointer-events-none rounded-[2.2rem]"></div>

               {/* Hidden file processor for Html5Qrcode - persistent layout layer fix */}
               <div id="qr-file-processor" className="absolute -left-[9999px] top-0 w-10 h-10 overflow-hidden opacity-0 pointer-events-none"></div>

               {!passType && !boardingStatus && (
                 <div className="relative z-10 space-y-10">
                    <div className="text-center">
                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Initialize Boarding</h3>
                       <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Choose Authentication Mode</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <InteractionTile 
                        onClick={() => setPassType("monthly")}
                        icon={<Ticket size={32} />}
                        title="Neural Pass"
                        subtitle="VERIFIED"
                        desc="Sync your active student pass."
                      />
                      <InteractionTile 
                        onClick={() => setPassType("dayPass")}
                        icon={<CreditCard size={32} />}
                        title="Direct Pay"
                        subtitle="ON-DEMAND"
                        desc="Initiate digital fare checkout."
                      />
                    </div>
                 </div>
               )}

               {passType === "monthly" && !boardingStatus && (
                 <div className="relative z-10 flex flex-col items-center py-6 animate-[slideUp_0.4s_ease-out]">
                    <div className="w-20 h-20 bg-emerald-500 rounded-3xl border border-emerald-400 flex items-center justify-center text-slate-900 mb-8 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                       <Ticket size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2 text-center underline decoration-emerald-500 decoration-4">ACCESS GRANTED</h3>
                    <p className="text-slate-500 text-center text-sm font-bold mb-10 max-w-xs">Verified pass detected. Tap below to confirm attendance on Node {assignedBus?.busId}.</p>
                    
                    <button 
                       onClick={() => confirmBoarding()}
                       className="w-full max-w-xs bg-slate-900 text-emerald-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-slate-950"
                    >
                       Confirm Boarding
                    </button>
                    <button onClick={() => setPassType("")} className="mt-6 text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest">Back to mode selection</button>
                 </div>
               )}

               {passType === "dayPass" && !boardingStatus && (
                 <div className="relative z-10 flex flex-col items-center py-4 animate-[slideUp_0.4s_ease-out]">
                    <div className="mb-10 text-center">
                       <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">Checkout Seq</h3>
                       <p className="text-emerald-600 text-xs font-black uppercase tracking-widest">FARE_AMT: ₹20</p>
                    </div>

                    {isScanning ? (
                      <div className="w-full max-w-sm mb-6">
                         <div className="bg-[#1a1c23] border-8 border-slate-400 rounded-[2rem] overflow-hidden shadow-2xl relative aspect-square">
                            <div id="reader" className="w-full h-full grayscale opacity-80"></div>
                            <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay"></div>
                            <div className="absolute inset-x-10 top-1/2 -translate-y-1/2 h-1 bg-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-[scanning_2s_infinite]"></div>
                         </div>
                         <button onClick={() => setIsScanning(false)} className="w-full mt-6 text-[10px] font-black text-slate-500 hover:text-rose-500 uppercase tracking-widest">Cancel Scan</button>
                      </div>
                    ) : (
                       <div className="w-full max-w-sm space-y-6">
                         <div className="bg-[#cbd5e0] border-2 border-dashed border-slate-400 rounded-3xl p-8 flex flex-col items-center group relative overflow-hidden transition-all hover:bg-[#dee2e6] hover:border-slate-800">
                            <div className="flex flex-col items-center">
                               <Camera className="text-slate-500 mb-2" size={32} />
                               <p className="text-[10px] font-black text-slate-500 text-center uppercase tracking-widest leading-relaxed">Scan vehicle node to trigger checkout</p>
                            </div>
                            
                            <div className="mt-6 pt-6 border-t border-slate-400/50 w-full flex flex-col items-center">
                               <label className="cursor-pointer flex flex-col items-center gap-2 group/upload">
                                  <div className="w-10 h-10 rounded-full bg-slate-400/20 flex items-center justify-center text-slate-500 group-hover/upload:bg-emerald-500/20 group-hover/upload:text-emerald-500 transition-all">
                                     <Upload size={18} />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover/upload:text-slate-800 transition-colors">Attach Image Node</span>
                                  <input 
                                     type="file" 
                                     accept="image/*" 
                                     className="hidden" 
                                     onChange={handleFileUpload}
                                  />
                               </label>
                            </div>
                         </div>

                         <button 
                            onClick={() => setIsScanning(true)}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-slate-950"
                          >
                            <Scan size={20} /> Launch Scanner
                         </button>
                         <button onClick={() => setPassType("")} className="w-full text-[10px] font-black text-slate-500 hover:text-slate-900 uppercase tracking-widest text-center">Back</button>
                      </div>
                    )}
                 </div>
               )}

               {boardingStatus && (
                 <div className="relative z-10 flex flex-col items-center py-10 animate-[zoomIn_0.3s_ease-out] text-center">
                    <div className={cn(
                      "w-20 h-20 rounded-3xl flex items-center justify-center mb-8 border-2 transition-all shadow-2xl",
                      boardingStatus.type === 'error' ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 
                      boardingStatus.type === 'success' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 
                      'bg-blue-500/20 border-blue-500 text-blue-500 shadow-blue-500/20'
                    )}>
                       {boardingStatus.type === 'error' ? <AlertCircle size={38} /> : 
                        boardingStatus.type === 'success' ? <CheckCircle size={38} /> : 
                        <Loader2 className="animate-spin" size={38} />}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 max-w-xs">{boardingStatus.msg}</h3>
                    
                    {boardingStatus.type !== 'info' && (
                       <Link href="/tracking" className="mt-6 bg-[#cbd5e0] border-2 border-slate-400 text-slate-800 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 hover:text-white transition active:scale-95 shadow-lg flex items-center gap-2">
                          Return to Console <ChevronRight size={16} />
                       </Link>
                    )}
                 </div>
               )}

            </div>

            {/* Verification Footer Indicator */}
            <div className="flex justify-center items-center gap-8 opacity-40">
               <div className="flex items-center gap-2 grayscale brightness-50">
                  <ShieldCheck size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Secure_Hash_v3</span>
               </div>
               <div className="flex items-center gap-2 grayscale brightness-50">
                  <Activity size={18} /> <span className="text-[10px] font-black uppercase tracking-widest">Latency_Synced</span>
               </div>
            </div>

          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scanning { 
          0% { transform: translateY(-120px); opacity: 0; }
          30% { opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(120px); opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
}

/* === REUSABLE UI === */

function SideItem({ icon, label, active, href }) {
  return (
    <Link href={href || "#"} className="w-full block group">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-bold text-sm",
        active 
          ? "bg-[#2d3436] text-white shadow-lg shadow-black/30" 
          : "text-slate-500 hover:bg-[#2d3436]/50 hover:text-slate-300"
      )}>
        <div className={cn("transition-all duration-300", active && "text-emerald-500")}>
          {icon}
        </div>
        <span className="tracking-wide">{label}</span>
      </div>
    </Link>
  );
}

function InteractionTile({ onClick, icon, title, subtitle, desc }) {
  return (
    <button onClick={onClick} className="bg-[#cbd5e0] border-2 border-slate-400 rounded-3xl p-8 text-left transition-all duration-300 hover:border-slate-800 hover:shadow-xl group relative overflow-hidden">
       <div className="w-14 h-14 bg-[#dee2e6] border-2 border-slate-400 rounded-2xl flex items-center justify-center text-slate-500 mb-8 transition-colors group-hover:bg-slate-900 group-hover:text-emerald-500 group-hover:border-slate-950 shadow-inner">
          {icon}
       </div>
       <h4 className="text-xl font-black text-slate-900 tracking-tighter mb-1 leading-none">{title}</h4>
       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">{subtitle}</p>
       <p className="text-xs text-slate-600 font-bold leading-relaxed">{desc}</p>
       
       <div className="absolute top-6 right-6 text-slate-400 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <ChevronRight size={24} />
       </div>
    </button>
  );
}
