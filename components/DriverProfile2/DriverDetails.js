"use client";

import { useState, useEffect, useRef } from "react";
import { User, Shield, Award, Calendar, Edit3, Check, X, Camera, BadgeCheck, Zap, Activity, Truck, Map as MapIcon, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function DriverDetails() {
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "" });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    try {
      const [profileRes, assignRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/driver/assignment")
      ]);
      
      const profileData = await profileRes.json();
      const assignData = await assignRes.json();
      
      if (profileData.user) {
        setUser(profileData.user);
        setFormData({ name: profileData.user.name || "" });
      }
      if (assignData.bus) {
        setAssignment(assignData);
      }
    } catch (err) {
      console.error("Failed to fetch context:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (blob = null) => {
    setUpdateLoading(true);
    try {
      const payload = blob ? { ...formData, image: blob } : formData;
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await fetchContext();
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      handleUpdate(base64).then(() => setIsUploading(false));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-black">
        <Activity className="text-[#39FF14] animate-pulse" size={48} />
      </div>
    );
  }

  return (
    <section className="py-24 bg-black relative overflow-hidden pt-36">
      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      
      {/* Neon Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-1" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-ping" />
              <h2 className="text-[10px] font-black tracking-[0.4em] text-[#39FF14] uppercase">Operator_Profile / System_Active</h2>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter sm:text-7xl uppercase">
              Driver <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39FF14] to-emerald-400">Console</span>
            </h1>
          </div>
          
          <button 
            onClick={() => isEditing ? handleUpdate() : setIsEditing(true)}
            disabled={updateLoading}
            className={cn(
              "px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border-2",
              isEditing 
                ? "bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_30px_rgba(57,255,20,0.5)]" 
                : "bg-transparent border-[#39FF14]/40 text-[#39FF14] hover:border-[#39FF14] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
            )}
          >
            {updateLoading ? <Activity className="animate-spin" size={16} /> : isEditing ? <Check size={16} /> : <Edit3 size={16} />}
            {isEditing ? "Save Configuration" : "Modify Profile"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* IDENTIFICATION CORE */}
          <div className="lg:col-span-2">
            <div className="bg-black/80 backdrop-blur-xl rounded-[2.5rem] p-10 border-2 border-[#39FF14]/20 shadow-[0_0_50px_rgba(0,0,0,1)] relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield size={120} className="text-[#39FF14]" />
              </div>

              <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                {/* Visual Avatar with Upload Logic */}
                <div className="relative shrink-0 cursor-pointer group/avatar" onClick={handleImageClick}>
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-[2rem] overflow-hidden border-2 border-[#39FF14]/50 p-2 bg-[#39FF14]/5 shadow-[0_0_40px_rgba(57,255,20,0.15)] group-hover/avatar:border-[#39FF14] transition-all duration-500 relative">
                    {isUploading ? (
                       <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                          <Activity className="text-[#39FF14] animate-spin" size={32} />
                       </div>
                    ) : (
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center text-[#39FF14]">
                          <Camera size={32} className="mb-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Update_Image</span>
                       </div>
                    )}
                    <img
                      src={user?.image || "https://images.unsplash.com/photo-1543165365-07232ed12fad?q=80&w=400&auto=format&fit=crop"}
                      alt="Driver profile"
                      className="w-full h-full object-cover rounded-[1.5rem] grayscale group-hover/avatar:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-black border-2 border-[#39FF14] p-3 rounded-2xl shadow-[0_0_20px_rgba(57,255,20,0.4)]">
                    <BadgeCheck className="text-[#39FF14]" size={24} />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>

                {/* Info Fields */}
                <div className="flex-1 w-full space-y-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-[#39FF14]/60 uppercase tracking-[0.3em]">Full Name / Identity</p>
                    {isEditing ? (
                      <input 
                        className="w-full bg-white/5 border-2 border-[#39FF14]/30 rounded-xl px-4 py-3 text-2xl font-black text-white focus:border-[#39FF14] outline-none shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        autoFocus
                      />
                    ) : (
                      <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
                        {user?.name || "IDENT_UNSET"}
                      </h3>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatBox icon={<Truck size={18} />} label="Unit_Node" value={assignment?.bus?.busId || "PENDING_LINK"} active />
                    <StatBox icon={<MapIcon size={18} />} label="Sector_Link" value={assignment?.route?.name || "UNASSIGNED"} />
                    <StatBox icon={<Award size={18} />} label="License_Hash" value={user?.email ? `#ID-${user.email.split('@')[0].toUpperCase()}` : "UNVERIFIED"} />
                    <StatBox icon={<Activity size={18} />} label="Link_State" value="System_Green" />
                  </div>
                </div>
              </div>

              {/* Decorative Corner Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#39FF14]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#39FF14]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#39FF14]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#39FF14]" />
            </div>
          </div>

          {/* EFFICIENCY & PAYMENT MODULE */}
          <div className="lg:col-span-1 space-y-10">
             <div className="bg-black border-2 border-[#39FF14]/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/5 to-transparent pointer-events-none" />
                <h4 className="text-xs font-black text-[#39FF14] uppercase tracking-[0.3em] mb-8">Efficiency_Readout</h4>
                
                <div className="space-y-8">
                  <MetricLine label="Safety_Index" value="98.4" color="#39FF14" />
                  <MetricLine label="Precision_Arrival" value="92.1" color="#39FF14" />
                  <MetricLine label="Fuel_Economy" value="84.0" color="#39FF14" />
                </div>
             </div>

             {/* TACTICAL PAYMENT QR (Razorpay Integration) */}
             <div className="bg-white/5 border-2 border-[#39FF14]/40 rounded-[2.5rem] p-10 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-20">
                   <Zap size={60} className="text-[#39FF14] animate-pulse" />
                </div>
                
                <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.4em] mb-8">Payment_Secure_Node</p>
                
                <div className="flex flex-col items-center gap-8">
                   <div className="relative group/qr">
                      <div className="absolute -inset-4 bg-[#39FF14]/10 blur-xl rounded-full opacity-0 group-hover/qr:opacity-100 transition-opacity" />
                      <div className="w-48 h-48 bg-white p-3 rounded-2xl shadow-[0_0_40px_rgba(57,255,20,0.2)] relative z-10 transition-transform hover:scale-105 duration-500">
                         {/* RAZORPAY STYLE QR PAYLOAD */}
                         <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=smarttransit@razorpay&pn=SmartTransit%20Service&am=0&cu=INR&tn=Transit%20Fare`} 
                            alt="Razorpay QR"
                            className="w-full h-full object-contain"
                         />
                      </div>
                      
                      {/* SCANNER LINE ANIMATION */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#39FF14] blur-sm animate-[scanline_3s_linear_infinite] z-20 pointer-events-none" />
                   </div>
                   
                   <div className="text-center space-y-2">
                      <h4 className="text-xl font-black text-white uppercase tracking-tighter">Razorpay Instant Pay</h4>
                      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                         Students can scan to verify <br/> & execute fare transfer immediately.
                      </p>
                   </div>
                   
                   <div className="w-full grid grid-cols-2 gap-4 pt-4">
                      <div className="bg-black/40 border border-[#39FF14]/20 p-4 rounded-xl text-center">
                         <p className="text-[8px] font-bold text-[#39FF14] uppercase mb-1">Status</p>
                         <p className="text-xs font-black text-white">READY</p>
                      </div>
                      <div className="bg-black/40 border border-white/10 p-4 rounded-xl text-center">
                         <p className="text-[8px] font-bold text-white/30 uppercase mb-1">Latency</p>
                         <p className="text-xs font-black text-white">0.01ms</p>
                      </div>
                   </div>
                </div>

                <style jsx>{`
                   @keyframes scanline {
                      0% { transform: translateY(0); }
                      50% { transform: translateY(192px); }
                      100% { transform: translateY(0); }
                   }
                `}</style>
             </div>

             <div className="bg-[#39FF14] rounded-[2rem] p-10 text-black shadow-[0_0_40px_rgba(57,255,20,0.3)] group hover:scale-[1.02] transition-transform duration-500">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">Action_Roster</h4>
                <p className="text-2xl font-black leading-tight mb-8">Access Full Mission Schedule</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest border-2 border-black/20 px-3 py-1 rounded-full text-black/60">Node_Synced</span>
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-[#39FF14] shadow-xl group-hover:rotate-45 transition-transform">
                    <Zap size={24} fill="currentColor" />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBox({ icon, label, value, active }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 transition-all hover:border-[#39FF14]/40 hover:bg-[#39FF14]/5">
      <div className="flex items-center gap-3 mb-1">
        <div className={cn("text-white/40", active && "text-[#39FF14]")}>{icon}</div>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-lg font-black text-white">{value}</p>
    </div>
  );
}

function MetricLine({ label, value, color }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-black text-white tracking-tighter" style={{ color }}>{value}%</p>
      </div>
      <div className="h-2 bg-white/5 rounded-full p-[2px] border border-white/10">
        <div className="h-full rounded-full transition-all duration-1000" 
             style={{ width: `${value}%`, backgroundColor: color, boxShadow: `0 0 10px ${color}` }} />
      </div>
    </div>
  );
}
