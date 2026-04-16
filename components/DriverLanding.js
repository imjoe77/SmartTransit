"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowRight, ShieldCheck, BusFront, 
  Cpu, Power, Terminal, Zap, Gauge,
  LogOut, User, LayoutDashboard, Database, Activity,
  ChevronRight, Eye, Radar, Wifi, Radio, Lock, ShieldAlert,
  MapPinned, Globe, Network, Server, Share2, Award, Target,
  Settings, Key, Clock
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DriverLanding({ session }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [activeUser, setActiveUser] = useState(session?.user || null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const curtainsRef = useRef([]);
  const textRefs = useRef([]);
  const imageRef = useRef(null);
  const cardsRef = useRef(null);
  
  // Specific refs for scroll transitions
  const protocolGridRef = useRef(null);
  const safetyImgRef = useRef(null);
  const safetyTextRef = useRef(null);
  const archGridRef = useRef(null);
  const archTitleRef = useRef(null);
  const networkSectionRef = useRef(null);
  const networkCardsRef = useRef(null);
  const statusSectionRef = useRef(null);

  const addToTextRefs = (el) => { if (el && !textRefs.current.includes(el)) textRefs.current.push(el); };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. INTRO HERO ANIMATION
      const tl = gsap.timeline();
      gsap.set(curtainsRef.current, { height: "100%" });
      gsap.set(textRefs.current, { x: -100, opacity: 0, skewX: 20 });
      gsap.set(imageRef.current, { scale: 1.5, opacity: 0, filter: "brightness(0)" });
      gsap.set(cardsRef.current, { opacity: 0, y: 100 });

       if (curtainsRef.current?.length) tl.to(curtainsRef.current, { height: "0%", duration: 1.5, ease: "power4.inOut", stagger: { amount: 0.5, from: "center" } });
       if (imageRef.current) tl.to(imageRef.current, { scale: 1, opacity: 0.4, filter: "brightness(1)", duration: 2.5, ease: "expo.out" }, "-=1.5");
       if (textRefs.current?.length) tl.to(textRefs.current, { x: 0, opacity: 1, skewX: 0, duration: 1.2, ease: "power4.out", stagger: 0.15 }, "-=2");
       if (cardsRef.current) tl.to(cardsRef.current, { opacity: 1, y: 0, duration: 1, ease: "back.out(2)" }, "-=1");

       // 2. PROTOCOL GRID
       if (protocolGridRef.current) {
          gsap.from(protocolGridRef.current.children, {
            opacity: 0,
            y: 100,
            rotationX: -60,
            stagger: 0.2,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: protocolGridRef.current,
              start: "top 85%",
            }
          });
       }

       // 3. NETWORK SECTION
       if (networkSectionRef.current) {
          gsap.from(networkSectionRef.current, {
            opacity: 0,
            scale: 0.8,
            duration: 2,
            ease: "expo.out",
            scrollTrigger: {
              trigger: networkSectionRef.current,
              start: "top 80%",
            }
          });
       }

       if (networkCardsRef.current) {
          gsap.from(networkCardsRef.current.children, {
            opacity: 0,
            y: 50,
            stagger: 0.2,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: networkCardsRef.current,
              start: "top 85%",
            }
          });
       }

       // 4. SAFETY DYNAMICS
       if (safetyImgRef.current) {
          gsap.from(safetyImgRef.current, {
            opacity: 0,
            x: -200,
            duration: 1.8,
            ease: "power4.out",
            scrollTrigger: {
              trigger: safetyImgRef.current,
              start: "top 75%",
            }
          });
       }

       if (safetyTextRef.current) {
          gsap.from(safetyTextRef.current.children, {
            opacity: 0,
            x: 150,
            stagger: 0.1,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
              trigger: safetyTextRef.current,
              start: "top 75%",
            }
          });
       }

       // 5. STATUS / RANK SECTION
       if (statusSectionRef.current) {
          gsap.from(statusSectionRef.current, {
            opacity: 0,
            y: 100,
            duration: 1.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: statusSectionRef.current,
              start: "top 85%",
            }
          });
       }

       // 6. SYSTEM ARCH
       if (archTitleRef.current) {
          gsap.from(archTitleRef.current, {
            opacity: 0,
            y: -50,
            letterSpacing: "2em",
            duration: 2.5,
            ease: "power4.out",
            scrollTrigger: {
              trigger: archTitleRef.current,
              start: "top 90%",
            }
          });
       }

       if (archGridRef.current) {
          gsap.from(archGridRef.current.children, {
            opacity: 0,
            scale: 0,
            rotationZ: 180,
            stagger: 0.2,
            duration: 1.5,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: archGridRef.current,
              start: "top 85%",
            }
          });
       }

       // PARALLAX
       if (imageRef.current && containerRef.current) {
          gsap.to(imageRef.current, {
            y: "25%",
            ease: "none",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.5
            }
          });
       }

    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleTerminalEntry = (e) => {
    e.preventDefault();
    const overlay = document.getElementById("terminal-entry-overlay");
    if (!overlay) {
      router.push("/driver");
      return;
    }
    const tl = gsap.timeline({ onComplete: () => { router.push("/driver"); } });
    tl.set(overlay, { x: "100vw", display: "flex", pointerEvents: "auto" })
      .to(overlay, { x: "0vw", duration: 1.2, ease: "expo.inOut" });
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white font-mono selection:bg-[#39FF14] selection:text-black overflow-x-hidden">
      
      {/* GLOBAL TECH BG */}
      <div className="fixed inset-0 z-0 h-screen overflow-hidden pointer-events-none">
        <img 
          ref={imageRef}
          src="/driver_hero_bg_1776312228221.png" 
          className="w-full h-full object-cover filter brightness-[0.3] contrast-[1.3] scale-[1.1]"
          alt="Technical Cockpit"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
      </div>

      {/* TRANSITION OVERLAY */}
      <div id="terminal-entry-overlay" className="fixed inset-y-0 left-0 w-[100vw] bg-[#39FF14] z-[100] translate-x-[100vw] hidden items-center justify-center pointer-events-none">
         <div className="flex flex-col items-center gap-6">
            <Cpu className="text-black animate-spin" size={100} />
            <h2 className="text-black text-4xl font-black uppercase tracking-[0.5em]">SYNCING_FLEET_NODE...</h2>
         </div>
      </div>

      {/* INTRO CURTAINS */}
      <div className="fixed inset-0 z-[70] flex pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} ref={(el) => (curtainsRef.current[i] = el)} className="w-1/5 h-full bg-[#050505] border-r border-[#39FF14]/10" />
        ))}
      </div>

      {/* HEADER */}
      <header className="relative z-[60] px-12 py-8 flex justify-between items-center max-w-[1700px] mx-auto">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-10 h-10 bg-[#39FF14]/10 border border-[#39FF14]/40 rounded-lg flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all">
            <Terminal className="w-6 h-6 text-[#39FF14]" />
          </div>
          <h1 className="font-black text-xl tracking-[0.3em] uppercase text-white/90">Command<span className="text-[#39FF14]">Link</span></h1>
        </div>

        <nav className="hidden lg:flex items-center gap-12">

          <div className="relative">
            <div 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-5 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md hover:bg-white/10 transition-all cursor-pointer group active:scale-95"
            >
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest">Level_03_Operator</span>
                  <span className="text-xs font-bold text-white/80">{activeUser?.name || "Driver_01"}</span>
               </div>
               <Avatar className="w-10 h-10 border-2 border-[#39FF14]/30 group-hover:border-[#39FF14]/60 transition-all shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  <AvatarImage src={activeUser?.image} />
                  <AvatarFallback className="bg-[#111] text-[#39FF14] font-black text-lg">{activeUser?.name?.[0] || "D"}</AvatarFallback>
               </Avatar>
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-full right-0 mt-4 w-72 bg-[#080808] border border-[#39FF14]/30 rounded-[2rem] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 border-b border-white/5 mb-3">
                   <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-[0.3em]">Fleet_Security_Protocol</p>
                   <p className="text-white/40 text-[9px] font-bold uppercase mt-1">Authorized Access Zone</p>
                </div>
                
                <div className="space-y-1">
                   <DropdownItem icon={<User size={16} />} label="Unit Configuration" href="/driver/profile" />
                   <DropdownItem icon={<Clock size={16} />} label="Operational Stats" href="/dhistory" />
                   <DropdownItem icon={<Key size={16} />} label="Security Node" href="#" />
                   <div className="h-px bg-white/5 my-2" />
                   <button 
                     onClick={() => signOut({ callbackUrl: "/" })}
                     className="w-full flex items-center justify-between gap-3 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group"
                   >
                     <div className="flex items-center gap-3">
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Sign_Out Mission</span>
                     </div>
                     <ChevronRight size={14} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* 🚀 HERO SECTION */}
      <section className="relative z-10 flex flex-col items-start justify-center min-h-[90vh] px-12 lg:px-24 max-w-[1700px] mx-auto">
         <div className="max-w-6xl space-y-12">
            <div className="space-y-4">
               <div className="overflow-hidden">
                  <h1 ref={addToTextRefs} className="text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter uppercase text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                     COMMAND
                  </h1>
               </div>
               <div className="overflow-hidden">
                  <h1 ref={addToTextRefs} className="text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter text-[#39FF14] uppercase drop-shadow-[0_0_40px_rgba(57,255,20,0.4)]">
                     EVERY ROUTE.
                  </h1>
               </div>
            </div>

            <div className="overflow-hidden max-w-2xl">
               <p ref={addToTextRefs} className="text-xl lg:text-2xl text-white/60 font-medium leading-[1.6] uppercase tracking-wide">
                  Real-time telemetry, precision vectoring, and neural fatigue monitoring. CommandLink puts your entire shift on autopilot with elite technical assistance.
               </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-6 overflow-hidden">
               <div ref={addToTextRefs} className="flex flex-wrap gap-6">
                  <button 
                     onClick={handleTerminalEntry}
                     className="bg-[#39FF14] hover:bg-[#32e612] text-black px-14 py-6 rounded-full font-black text-lg uppercase tracking-widest flex items-center gap-4 transition-all shadow-[0_0_40px_rgba(57,255,20,0.5)] group active:scale-[0.98]"
                  >
                     Log_In to Terminal <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <Link 
                     href="/driver/profile"
                     className="bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/20 px-14 py-6 rounded-full font-black text-lg uppercase tracking-widest flex items-center gap-4 transition-all text-white group"
                  >
                     Config_System <User className="group-hover:rotate-12 transition-transform" />
                  </Link>
               </div>
            </div>
         </div>
         <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
            <Radar size={600} className="text-[#39FF14] animate-[spin_30s_linear_infinite]" />
         </div>
      </section>

      {/* 🧾 MISSION PROTOCOL SECTION */}
      <section className="relative z-10 px-12 lg:px-24 py-40 max-w-[1700px] mx-auto bg-black/40 backdrop-blur-sm border-y border-white/5 perspective-1000">
         <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12">
            <div className="space-y-4">
               <p className="text-[#39FF14] font-black text-[10px] uppercase tracking-[0.6em]">Standard Operational Procedure</p>
               <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter">Mission <br/> Protocol</h2>
            </div>
            <p className="text-white/40 max-w-sm text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">
               Adhering to strict synchronization phases ensuring 100% fleet visibility and driver safety across all sectors.
            </p>
         </div>

         <div ref={protocolGridRef} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <ProtocolCard step="01" icon={<Wifi />} title="Neural Sync" desc="Authenticate via biometric node and link with assigned fleet unit via unique QR check-in." />
            <ProtocolCard step="02" icon={<Radar />} title="Vector Cast" desc="Initiate high-precision GPS telemetry. Your unit becomes a live node on the tactical map." />
            <ProtocolCard step="03" icon={<Radio />} title="Safe Close" desc="End mission sequence to archive trip data and operational telemetry to centralized vault." />
         </div>
      </section>

      {/* 🌐 LIVE FLEET DYNAMICS */}
      <section ref={networkSectionRef} className="relative z-10 px-12 lg:px-24 py-40 max-w-[1700px] mx-auto">
         <div className="bg-[#39FF14]/5 border-2 border-[#39FF14]/10 rounded-[4rem] p-12 lg:p-24 relative overflow-hidden group">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
               <div className="lg:col-span-7 space-y-12">
                  <div className="space-y-4">
                     <p className="text-[#39FF14] font-black text-[11px] uppercase tracking-[0.8em]">Global Fleet Connectivity</p>
                     <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter leading-none">Live Fleet <br/> Dynamics</h2>
                  </div>
                  <p className="text-white/50 text-xl font-bold uppercase tracking-widest leading-relaxed">
                     Your unit is the central intelligence node. Every coordinate transmitted feeds the neural grid, optimizing routes for thousands of students in real-time.
                  </p>
                  <div ref={networkCardsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     <NetMetric icon={<Globe />} label="Global Nodes" val="4,210+" />
                     <NetMetric icon={<Share2 />} label="Mesh Sync" val="0.8s" />
                     <NetMetric icon={<Server />} label="Vault Core" val="99.99%" />
                  </div>
               </div>
               <div className="lg:col-span-5 relative">
                  <div className="absolute inset-0 bg-[#39FF14]/20 blur-[120px] animate-pulse" />
                  <div className="bg-black border border-[#39FF14]/30 rounded-[3rem] p-10 aspect-square flex items-center justify-center relative overflow-hidden">
                     <Network className="text-[#39FF14] w-48 h-48 animate-[pulse_4s_infinite]" />
                     <div className="absolute inset-0 border-[30px] border-[#39FF14]/5 rounded-full animate-[ping_6s_infinite]" />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 👁️ SAFETY SURVEILLANCE SECTION */}
      <section className="relative z-10 px-12 lg:px-24 py-40 max-w-[1700px] mx-auto grid lg:grid-cols-2 gap-24 items-center">
         <div ref={safetyImgRef} className="relative">
            <div className="absolute -inset-10 bg-[#39FF14]/5 blur-[120px] rounded-full" />
            <div className="bg-white/5 border border-[#39FF14]/20 rounded-[3rem] p-5 relative overflow-hidden group shadow-2xl">
               <div className="aspect-video bg-black rounded-[2.5rem] flex items-center justify-center relative overflow-hidden cursor-crosshair">
                  <Eye className="text-[#39FF14]/40 w-40 h-40 animate-pulse group-hover:scale-110 transition-transform duration-1000" />
                  <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-[#39FF14]/20 to-transparent">
                     <p className="text-[11px] font-black text-[#39FF14] uppercase tracking-[0.4em]">AI_Neural_Monitor_Active</p>
                  </div>
               </div>
               <div className="mt-10 grid grid-cols-2 gap-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:border-[#39FF14]/30 transition-all">
                     <p className="text-[9px] font-black text-white/30 uppercase mb-2">Focus_Metric</p>
                     <p className="text-2xl font-black text-[#39FF14]">OPTIMAL</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:border-[#39FF14]/30 transition-all">
                     <p className="text-[9px] font-black text-white/30 uppercase mb-2">Event_Alert</p>
                     <p className="text-2xl font-black text-[#39FF14]">0.02ms</p>
                  </div>
               </div>
            </div>
         </div>

         <div ref={safetyTextRef} className="space-y-10">
            <div className="w-20 h-2 bg-[#39FF14]" />
            <h2 className="text-7xl font-black uppercase tracking-tighter leading-tight">Safety <br/> Overdrive</h2>
            <p className="text-xl text-white/50 font-bold uppercase tracking-[0.1em] leading-relaxed">
               Advanced computer vision monitors driver fatigue in real-time. Instant alerts prevent accidents before they happen, keeping you and your passengers secure.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
               <FeatureItem icon={<ShieldAlert />} label="Instant SOS Link" />
               <FeatureItem icon={<Lock />} label="Biometric Gates" />
               <FeatureItem icon={<Activity />} label="Neural Monitoring" />
               <FeatureItem icon={<Terminal />} label="Auto Event Log" />
            </div>
         </div>
      </section>

      {/* 🏆 ELITE STATUS SECTION */}
      <section ref={statusSectionRef} className="relative z-10 px-12 lg:px-24 py-40 max-w-[1700px] mx-auto text-center overflow-hidden">
         <div className="space-y-6 mb-20">
            <p className="text-[#39FF14] font-black text-[11px] uppercase tracking-[1em]">Tier_Protocol_Activated</p>
            <h2 className="text-6xl lg:text-9xl font-black uppercase tracking-tighter">Elite Operator</h2>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatusCard icon={<Award size={40} />} title="Master Class" tier="V" stats="12.4k Miles" />
            <StatusCard icon={<Target size={40} />} title="Precision Ace" tier="IV" stats="98% Accuracy" highlight />
            <StatusCard icon={<ShieldCheck size={40} />} title="Guardian" tier="III" stats="0 Incident" />
         </div>
      </section>

      {/* ⚙️ SYSTEM ARCHITECTURE */}
      <section className="relative z-10 px-12 lg:px-24 py-40 max-w-[1700px] mx-auto">
         <div className="bg-[#080808] border-2 border-white/5 rounded-[5rem] p-16 lg:p-32 relative overflow-hidden group shadow-[0_0_100px_rgba(0,0,0,1)]">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#39FF14]/5 rounded-full blur-[180px] -mt-80 -mr-80 group-hover:scale-125 transition-transform duration-1000" />
            
            <div ref={archTitleRef} className="text-center space-y-6 mb-32 relative z-10">
               <p className="text-[#39FF14] font-black text-[11px] uppercase tracking-[0.8em]">Central Fleet Core</p>
               <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter">System Architecture</h2>
            </div>

            <div ref={archGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 relative z-10">
               <ArchBox icon={<Cpu />} label="Processor" value="Core-V9" />
               <ArchBox icon={<LayoutDashboard />} label="Uptime" value="99.99%" />
               <ArchBox icon={<Database />} label="Metadata" value="1.2PB" />
               <ArchBox icon={<Zap />} label="Response" value="1.2ms" />
            </div>

            {/* Final CTA */}
            <div className="mt-40 pt-20 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]">
                     <Radio className="animate-ping" size={28} />
                  </div>
                  <div>
                     <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest mb-1">Signal_Detected</p>
                     <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Ready for operational deployment?</p>
                  </div>
               </div>
               <button 
                  onClick={handleTerminalEntry}
                  className="bg-white text-black px-16 py-7 rounded-full font-black text-sm uppercase tracking-[0.5em] hover:bg-[#39FF14] hover:scale-105 transition-all shadow-2xl active:scale-95"
               >
                  Authorize_Deployment
               </button>
            </div>
         </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-20 px-12 py-24 border-t border-white/5 bg-black">
         <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-5">
               <div className="w-10 h-10 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-xl flex items-center justify-center">
                 <Terminal className="w-5 h-5 text-[#39FF14]" />
               </div>
               <span className="font-black text-lg tracking-[0.4em] uppercase">CommandLink v2.4</span>
            </div>
            <div className="flex gap-12 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
               <a href="#" className="hover:text-[#39FF14] transition-colors">Tactical_Brief</a>
               <a href="#" className="hover:text-[#39FF14] transition-colors">Safety_Vault</a>
               <a href="#" className="hover:text-[#39FF14] transition-colors">CI_Sync</a>
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.1em]">© 2026 SmartTransit Strategic Fleet Ops</p>
         </div>
      </footer>
    </div>
  );
}

function NavOption({ label, href, active }) {
   return (
      <Link href={href} className={cn(
         "text-xs font-black uppercase tracking-widest transition-all",
         active ? "text-[#39FF14] animate-pulse" : "text-white/40 hover:text-white"
      )}>
         {label}
      </Link>
   );
}

function DropdownItem({ icon, label, href }) {
   return (
      <Link 
         href={href}
         className="flex items-center justify-between gap-3 px-4 py-4 rounded-2xl text-white/70 hover:bg-white/5 hover:text-[#39FF14] transition-all group"
      >
         <div className="flex items-center gap-3">
            <div className="text-white/30 group-hover:text-[#39FF14] transition-colors">
               {icon}
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
         </div>
         <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
   );
}

function ProtocolCard({ step, icon, title, desc }) {
   return (
      <div className="bg-white/[0.03] border border-white/5 p-12 rounded-[3.5rem] space-y-8 hover:bg-white/[0.08] hover:border-[#39FF14]/40 transition-all group relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/5 rounded-full blur-3xl translate-x-16 -translate-y-16 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700" />
         <div className="flex justify-between items-start relative z-10">
            <div className="w-16 h-16 bg-black border border-white/10 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-all duration-500">
               {icon}
            </div>
            <span className="text-xl font-black text-white/10 font-mono italic group-hover:text-[#39FF14] transition-colors">{step}</span>
         </div>
         <h3 className="text-3xl font-black uppercase tracking-tighter relative z-10">{title}</h3>
         <p className="text-white/40 text-sm font-bold uppercase tracking-[0.1em] leading-relaxed relative z-10">
            {desc}
         </p>
      </div>
   );
}

function NetMetric({ icon, label, val }) {
   return (
      <div className="bg-black/50 border border-white/5 p-8 rounded-[2rem] hover:border-[#39FF14]/50 transition-all group">
         <div className="text-[#39FF14] mb-4 group-hover:scale-110 transition-transform">{icon}</div>
         <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">{label}</p>
         <p className="text-2xl font-black text-white tracking-tighter">{val}</p>
      </div>
   );
}

function FeatureItem({ icon, label }) {
   return (
      <div className="flex items-center gap-5 text-white/40 hover:text-[#39FF14] group transition-all">
         <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-[#39FF14] flex items-center justify-center group-hover:bg-[#39FF14]/10 group-hover:border-[#39FF14]/40 transition-all">
            {icon}
         </div>
         <span className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</span>
      </div>
   );
}

function StatusCard({ icon, title, tier, stats, highlight }) {
   return (
      <div className={cn(
         "p-12 rounded-[4rem] border-2 transition-all group relative overflow-hidden",
         highlight ? "bg-[#39FF14] border-[#39FF14] text-black shadow-[0_0_50px_rgba(57,255,20,0.3)] scale-105 z-10" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
      )}>
         <div className="mb-8 flex justify-center">{icon}</div>
         <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-2 opacity-60">Status: Tier {tier}</p>
         <h4 className="text-3xl font-black uppercase tracking-tighter mb-4">{title}</h4>
         <div className="w-10 h-1 bg-current mx-auto mb-6" />
         <p className="text-[11px] font-black uppercase tracking-widest">{stats}</p>
      </div>
   );
}

function ArchBox({ icon, label, value }) {
   return (
      <div className="space-y-6 group">
         <div className="flex items-center gap-4 text-white/30 group-hover:text-[#39FF14]/50 transition-colors">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-[0.4em] font-mono">{label}</span>
         </div>
         <p className="text-5xl font-black tracking-tighter text-white font-mono group-hover:text-[#39FF14] group-hover:translate-x-3 transition-all duration-700">{value}</p>
      </div>
   );
}
