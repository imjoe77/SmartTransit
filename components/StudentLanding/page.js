"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowRight, Map, BusFront, ShieldCheck, Ticket, 
  GraduationCap, Bot, User, Zap, Smartphone, ChevronDown, 
  Sparkles, Clock, Globe, ShieldAlert, Navigation2, Activity, MapPinned, LogOut
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";

gsap.registerPlugin(ScrollTrigger);

export default function StudentLanding({ session }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [activeUser, setActiveUser] = useState(session?.user || null);

  const handleStudentLoginClick = (e) => {
    e.preventDefault();
    const overlay = document.getElementById("portal-gate-overlay");
    if (!overlay) {
      router.push("/login?role=student");
      return;
    }
    const tl = gsap.timeline({ onComplete: () => { router.push("/login?role=student"); } });
    tl.set(overlay, { x: "100vw", display: "flex", pointerEvents: "auto" })
      .to(overlay, { x: "0vw", duration: 1, ease: "power4.inOut" });
  };

  const curtainsRef = useRef([]);
  const textRefs = useRef([]);
  const imageRef = useRef(null);
  const cardsRef = useRef(null);

  const addToTextRefs = (el) => { if (el && !textRefs.current.includes(el)) textRefs.current.push(el); };

  useEffect(() => {
    const ctx = gsap.context(() => {
      let mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline();
        gsap.set(curtainsRef.current, { height: "100%" });
        gsap.set(textRefs.current, { y: 40, opacity: 0 });
        gsap.set(imageRef.current, { scale: 1.1, filter: "brightness(0.2) blur(10px)" });
        gsap.set(cardsRef.current, { opacity: 0, y: 50 });

        if (curtainsRef.current?.length) {
          tl.to(curtainsRef.current, { height: "0%", duration: 1, ease: "expo.inOut", stagger: 0.05 });
        }

        if (imageRef.current) {
          tl.to(imageRef.current, { scale: 1, filter: "brightness(0.3) blur(0px)", duration: 2, ease: "power2.out" }, "-=0.5");
        }

        if (textRefs.current?.length) {
          tl.to(textRefs.current, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.1 }, "-=1.2");
        }

        if (cardsRef.current) {
          tl.to(cardsRef.current, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.6");
        }

        // Scroll Reveal Animations for new sections
        gsap.utils.toArray(".reveal-section").forEach((section) => {
          gsap.from(section, {
            opacity: 0,
            y: 60,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          });
        });

        // Animated background parallax
        gsap.to(imageRef.current, {
          y: 200,
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true
          }
        });

        // Floating animation for utility cards
        gsap.to(".utility-card-float", {
          y: -15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.3
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set(curtainsRef.current, { display: "none" });
        gsap.set(textRefs.current, { y: 0, opacity: 1 });
        gsap.set(imageRef.current, { scale: 1, filter: "brightness(0.3) blur(0px)", y: 0 });
        gsap.set(cardsRef.current, { opacity: 1, y: 0 });
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans selection:bg-emerald-500">
      
      {/* BACKGROUND IMAGE - PRESERVED BUT SUBTLE */}
      <div className="fixed inset-0 z-0">
        <img 
          ref={imageRef}
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Library Background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950" />
      </div>

      {/* TRANSITION OVERLAY */}
      <div id="portal-gate-overlay" className="fixed inset-y-0 left-0 w-[100vw] bg-emerald-600 z-[100] translate-x-[100vw] hidden items-center justify-center pointer-events-none">
         <BusFront className="text-white animate-pulse" size={120} />
      </div>

      <div className="fixed inset-0 z-50 flex pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} ref={(el) => (curtainsRef.current[i] = el)} className="w-1/5 h-full bg-emerald-600 origin-top" />
        ))}
      </div>

      {/* HEADER */}
      <header className="relative z-[60] px-8 py-6 flex justify-between items-center max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-950 shadow-lg group-hover:bg-emerald-400 transition-all">
             <GraduationCap className="w-5 h-5" />
          </div>
          <h1 className="font-black text-lg tracking-tight text-white uppercase italic">Smart<span className="text-emerald-400">Transit</span></h1>
        </div>

        <nav className="flex items-center gap-8">
          <div className="relative">
             <button 
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md transition-all group"
             >
                {activeUser ? (
                   <>
                      <Avatar className="w-6 h-6 border border-emerald-400/50">
                         <AvatarImage src={activeUser.image} />
                         <AvatarFallback className="bg-emerald-500 text-slate-900 font-bold text-[10px]">{activeUser.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-black text-white/80">{activeUser.name || "User"}</span>
                   </>
                ) : (
                   <span className="text-[10px] font-black text-white/80 px-2">Sign In</span>
                )}
                <ChevronDown className={cn("w-3 h-3 text-white/30 transition-transform", loginDropdownOpen && "rotate-180")} />
             </button>

             <AnimatePresence>
                {loginDropdownOpen && (
                   <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-100/10 rounded-2xl p-2 shadow-2xl z-[100]"
                   >
                      {activeUser ? (
                        <>
                           <DropdownLink href="/profile" icon={<User size={14} />} label="User Profile" />
                           <div className="h-px bg-slate-200 my-1 opacity-10" />
                           <button 
                              onClick={() => signOut({ callbackUrl: "/" })}
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-all"
                           >
                              <LogOut size={14} /> Terminate Session
                           </button>
                        </>
                      ) : (
                        <>
                           <DropdownLink href="/login?role=student" icon={<GraduationCap size={14} />} label="Student Access" />
                           <DropdownLink href="/login?role=driver" icon={<BusFront size={14} />} label="Driver Node" />
                           <DropdownLink href="/login?role=admin" icon={<ShieldCheck size={14} />} label="Admin Control" />
                        </>
                      )}
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </nav>
      </header>

      {/* HERO CONTENT - REDUCED SIZES */}
      <main className="relative z-10 flex flex-col items-center justify-center min-vh-[80vh] py-20 px-6 text-center max-w-[1400px] mx-auto">
         <div className="max-w-4xl space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 mx-auto"
            >
               <Sparkles size={12} /> Live Network Active
            </motion.div>

            <div className="space-y-4">
               <h1 ref={addToTextRefs} className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter uppercase italic text-white drop-shadow-2xl">
                  Precision <br />
                  <span className="text-emerald-400">Transiting.</span>
               </h1>
               <p ref={addToTextRefs} className="text-sm lg:text-base text-white/50 font-bold uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
                  Experience the next iteration of campus mobility. High-precision telemetry and AI optimization in a single node.
               </p>
            </div>

            <div ref={addToTextRefs} className="flex flex-wrap items-center justify-center gap-6 pt-4">
               <button 
                  onClick={handleStudentLoginClick}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
               >
                  Authorize Console <ArrowRight size={14} />
               </button>
               <Link 
                  href="/chat"
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 transition-all text-white/80"
               >
                  Query AI Assistant <Bot size={14} />
               </Link>
            </div>
         </div>
      </main>

      {/* COMPACT UTILITY CARDS */}
      <div ref={cardsRef} className="relative z-10 px-6 pb-32 max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
         <UtilityCard icon={<MapPinned size={24} />} title="Live Hub" desc="Precision telemetry." color="emerald" />
         <UtilityCard icon={<Zap size={24} />} title="Neural ETA" desc="AI delay logic." color="blue" />
         <UtilityCard icon={<Smartphone size={24} />} title="Cloud Pass" desc="Biometric check." color="purple" />
      </div>

      {/* NEW SECTION 1: LIVE METRICS */}
      <section className="reveal-section relative z-10 px-6 py-32 max-w-[1200px] mx-auto border-t border-white/5">
         <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
               <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Real-Time <br/> Performance.</h2>
               <p className="text-white/40 font-medium leading-relaxed uppercase text-xs tracking-[0.2em]">
                  Our engine syncs every 200ms to ensure you never lose sight of your fleet. 
               </p>
               <div className="space-y-4">
                  <MetricItem icon={<Globe size={18} />} label="Global Mesh Sync" val="0.14s" />
                  <MetricItem icon={<Navigation2 size={18} />} label="Vector Deviation" val="< 2m" />
                  <MetricItem icon={<Activity size={18} />} label="Heartbeat Uptime" val="99.9%" />
               </div>
            </div>
            <div className="bg-slate-900/40 border border-white/10 rounded-[3rem] p-10 aspect-video flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/10 transition-all" />
               <div className="text-center relative z-10 space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6">
                     <Clock size={40} className="animate-spin-slow" />
                  </div>
                  <p className="font-black text-2xl tracking-tighter italic">WAITING_MINIMIZED</p>
               </div>
            </div>
         </div>
      </section>

      {/* NEW SECTION 2: SAFETY PROTOCOLS */}
      <section className="reveal-section relative z-10 px-6 py-32 max-w-[1200px] mx-auto">
         <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-[3rem] p-12 lg:p-20 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
               <div className="w-12 h-1.5 bg-emerald-500" />
               <h2 className="text-4xl lg:text-5xl font-black uppercase italic tracking-tight">Safety <br/> Overdrive.</h2>
               <p className="text-white/50 text-sm font-bold uppercase tracking-widest leading-relaxed">
                  Advanced fatigue monitoring and panic response nodes integrated into every operational route. Your safety is our primary architecture.
               </p>
               <Link href="/tracking" className="inline-flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest hover:gap-4 transition-all">
                  Audit Safety Hub →
               </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <SafetyNode icon={<ShieldAlert />} label="SOS Uplink" />
               <SafetyNode icon={<Navigation2 />} label="Auto-Route" />
               <SafetyNode icon={<Activity />} label="Biometrics" />
               <SafetyNode icon={<BusFront />} label="Safe Stop" />
            </div>
         </div>
      </section>

      {/* NEW SECTION 3: MOBILE READY */}
      <section className="reveal-section relative z-10 px-6 py-32 text-center max-w-[800px] mx-auto">
         <div className="space-y-8">
            <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter">Any Device. <br/> Any Node.</h2>
            <p className="text-white/40 text-sm font-medium uppercase tracking-[0.2em] leading-relaxed">
               The SmartTransit grid is fully responsive. Access your dashboard, chat with the AI assistant, or verify your boarding pass from any mobile browser.
            </p>
            <div className="pt-10">
               <button className="bg-white text-slate-950 px-12 py-5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-2xl active:scale-95">
                  Launch Mobile Grid →
               </button>
            </div>
         </div>
      </section>

      <footer className="relative z-10 px-8 py-16 border-t border-white/5 bg-black/20 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">© 2026 SmartTransit Fleet Control</p>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}

function DropdownLink({ href, icon, label }) {
   return (
    <Link href={href} className="w-full flex items-center gap-3 px-3 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-all">
       {icon} {label}
    </Link>
   );
}

function UtilityCard({ icon, title, desc, color }) {
   const variants = {
     emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
     blue: "bg-blue-500/10 text-blue-400 border-blue-400/20",
     purple: "bg-purple-500/10 text-purple-400 border-purple-400/20"
   };
   return (
     <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 flex flex-col gap-5 hover:bg-slate-900/90 transition-all group">
         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", variants[color])}>
            {icon}
         </div>
         <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tight italic">{title}</h3>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">{desc}</p>
         </div>
     </div>
   );
}

function MetricItem({ icon, label, val }) {
   return (
      <div className="flex items-center justify-between py-4 border-b border-white/5 group hover:border-emerald-500/30 transition-all">
         <div className="flex items-center gap-4">
            <div className="text-emerald-500/40 group-hover:text-emerald-400 transition-colors">{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</span>
         </div>
         <span className="text-sm font-black text-white">{val}</span>
      </div>
   );
}

function SafetyNode({ icon, label }) {
   return (
     <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all group">
        <div className="text-emerald-500/40 group-hover:text-emerald-400 transition-all mb-3 flex justify-center">{icon}</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-white/60">{label}</p>
     </div>
   );
}