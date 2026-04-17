"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight, LogIn, Globe, Shield, User, GraduationCap, BusFront } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

/* == MAIN PAGE ====================================================== */
export default function LandingPage() {
  return (
    <div className="overflow-x-hidden font-sans antialiased text-slate-900 bg-white">
      <PageTransition />
      <Navbar />
      <Hero />
      <SectionWrapper><StatsStrip /></SectionWrapper>
      <SectionWrapper><Roles /></SectionWrapper>
      <SectionWrapper><InteractiveFeatures /></SectionWrapper>
      <SectionWrapper><FeatureShowcase /></SectionWrapper>
      <SectionWrapper><LiveDemoSection /></SectionWrapper>
      <SectionWrapper><TechStack /></SectionWrapper>
      <SectionWrapper><Testimonials /></SectionWrapper>
      <SectionWrapper><Contact /></SectionWrapper>
      <SectionWrapper><CTA /></SectionWrapper>
      <Footer />
    </div>
  );
}

/* == ANIMATION WRAPPER =============================================== */
// A reusable component to handle scroll-reveals for any child section
function SectionWrapper({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    let mm = gsap.matchMedia();
    
    mm.add("(min-width: 768px)", () => {
      // Deskto/Tablet animations
      gsap.from(ref.current, {
        opacity: 0,
        y: 100,
        scale: 0.95,
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          end: "top 40%",
          toggleActions: "play none none reverse",
        }
      });
    });

    mm.add("(max-width: 767px)", () => {
      // Mobile: Ensure element is visible with no animation
      gsap.set(ref.current, { opacity: 1, y: 0, scale: 1 });
    });

    return () => mm.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}

/* == PAGE TRANSITION ================================================= */
function PageTransition() {
  const overlay = useRef(null);
  const text = useRef(null);
  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      const tl = gsap.timeline();
      gsap.set(overlay.current, { scaleY: 1, transformOrigin: "top" });
      gsap.set(text.current, { opacity: 0, y: 20 });
      tl.to(text.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power4.out",
        delay: 0.2,
      })
        .to(text.current, {
          opacity: 0,
          y: -20,
          duration: 0.4,
          ease: "power3.in",
          delay: 0.4,
        })
        .to(overlay.current, {
          scaleY: 0,
          duration: 1,
          ease: "expo.inOut",
          transformOrigin: "bottom",
        });
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set(overlay.current, { display: "none", opacity: 0, visibility: "hidden" });
    });

    return () => mm.revert();
  }, []);
  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[9999] bg-emerald-900 hidden md:flex items-center justify-center pointer-events-none"
    >
      <div ref={text} className="text-center">
        <h2 className="text-4xl md:text-7xl font-black text-white tracking-widest uppercase">
          Initializing<span className="text-emerald-400">...</span>
        </h2>
      </div>
    </div>
  );
}

/* == NAVBAR ========================================================== */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const leaveTimer = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const openLogin = () => { clearTimeout(leaveTimer.current); setLoginOpen(true); };
  const closeLogin = () => { leaveTimer.current = setTimeout(() => setLoginOpen(false), 200); };

  const LOGIN_ROLES = [
    { role: "Student", desc: "Live tracking & ETAs", href: "/login?role=student", icon: "🎓" },
    { role: "Driver", desc: "Broadcast GPS coords", href: "/login?role=driver", icon: "🚌" },
    { role: "Admin", desc: "Fleet & Root control", href: "/login?role=admin", icon: "⚙️" },
  ];

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[200] transition-all duration-500 ${
        scrolled
          ? "py-3 bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-lg shadow-emerald-900/5"
          : "py-6 bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-lg group-hover:bg-emerald-500 transition-colors">
            ST
          </div>
          <span className={`font-black text-xl tracking-tighter transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
            Smart<span className={scrolled ? "text-emerald-600" : "text-emerald-300"}>Transit</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          <NavLink label="Platform" href="#platform" scrolled={scrolled} />
          <NavLink label="Features" href="#features" scrolled={scrolled} />
          <NavLink label="Live Demo" href="#demo" scrolled={scrolled} />
          <NavLink label="Contact" href="#contact" scrolled={scrolled} />
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
           {/* Mobile Menu Toggle */}
           <button 
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             className={`lg:hidden p-2 rounded-xl transition-all ${scrolled ? "text-slate-900 bg-slate-100" : "text-white bg-white/10"}`}
           >
             {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
           </button>
          <div className="relative" onMouseEnter={openLogin} onMouseLeave={closeLogin} onClick={() => setLoginOpen(!loginOpen)}>
            <button className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
              scrolled 
                ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300" 
                : "bg-white/10 border-white/20 text-white hover:bg-white/20"
            }`}>
              Login
            </button>
            <AnimatePresence>
              {loginOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-64 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2"
                >
                  {LOGIN_ROLES.map((role) => (
                    <Link key={role.role} href={role.href} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="text-xl">{role.icon}</div>
                      <div>
                        <div className="text-slate-900 font-bold text-sm">{role.role}</div>
                        <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest">{role.desc}</div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/login?role=student" className="hidden sm:block px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-black hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
            Get Started
          </Link>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
         {mobileMenuOpen && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               exit={{ opacity: 0, height: 0 }}
               className="lg:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
               <div className="px-6 py-8 space-y-6">
                  <div className="flex flex-col gap-4">
                     <MobileNavLink label="Platform" href="#platform" onClick={() => setMobileMenuOpen(false)} />
                     <MobileNavLink label="Features" href="#features" onClick={() => setMobileMenuOpen(false)} />
                     <MobileNavLink label="Live Demo" href="#demo" onClick={() => setMobileMenuOpen(false)} />
                     <MobileNavLink label="Contact" href="#contact" onClick={() => setMobileMenuOpen(false)} />
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="grid grid-cols-1 gap-3">
                     <Link href="/login?role=student" className="w-full py-4 bg-emerald-600 text-white text-center rounded-xl font-black text-xs uppercase tracking-widest">Student Portal</Link>
                     <Link href="/login?role=driver" className="w-full py-4 bg-slate-100 text-slate-900 text-center rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200">Driver Console</Link>
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({ label, href, onClick }) {
   return (
      <Link href={href} onClick={onClick} className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-600 flex justify-between items-center group">
         {label}
         <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all" />
      </Link>
   );
}

function NavLink({ label, href, scrolled }) {
  return (
    <Link 
      href={href} 
      className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all relative group ${
        scrolled ? "text-slate-500 hover:text-emerald-600" : "text-white/60 hover:text-white"
      }`}
    >
      {label}
      <span className={`absolute -bottom-1 left-0 h-[2px] bg-emerald-500 transition-all duration-300 w-0 opacity-0 group-hover:w-full group-hover:opacity-100`} />
    </Link>
  );
}

/* == HERO ============================================================ */
function Hero() {
  const bgRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      gsap.fromTo(bgRef.current, { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 2, ease: "slow(0.7, 0.7, false)" });
      gsap.fromTo(contentRef.current, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power4.out", delay: 0.8 });
      
      gsap.to(bgRef.current, {
        y: 200,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    });

    mm.add("(max-width: 767px)", () => {
      gsap.set(bgRef.current, { scale: 1, opacity: 1, y: 0 });
      gsap.set(contentRef.current, { y: 0, opacity: 1 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-emerald-950">
      {/* Background Image with Overlay */}
      <div 
        ref={bgRef}
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/soft_green_transit_bg_1776352625122.png')" }}
      >
        <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/20 px-4 py-2 rounded-full mb-8"
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">Intelligent Fleet Logistics</span>
        </motion.div>

        <h1 className="text-4xl md:text-6xl lg:text-[7.5rem] font-black tracking-tighter leading-[1] md:leading-[0.85] mb-8">
          TRANSIT<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            UNLEASHED.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-emerald-100/70 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
          Experience the next generation of campus mobility. High-precision GPS tracking, AI-driven delay prediction, and seamless role-based navigation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login?role=driver" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-emerald-900 font-black text-lg hover:bg-emerald-50 shadow-2xl transition-all">
            Join the Grid
          </Link>
          <a href="/login?role=admin" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-emerald-800/40 border border-emerald-400/30 text-white font-black text-lg hover:bg-emerald-800/60 backdrop-blur-md transition-all">
            Live Simulator
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hidden md:block">
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-emerald-400/40"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

/* == STATS STRIP ===================================================== */
function StatsStrip() {
  const stats = [
    { v: "0.2s", l: "Sync Rate", d: "Real-time sync" },
    { v: "99.9%", l: "Precision", d: "RAG Accuracy" },
    { v: "24/7", l: "Watchdog", d: "Active uptime" },
    { v: "Elite", l: "Fleet", d: "Top-tier nodes" },
  ];

  return (
    <section className="py-20 bg-white border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="text-center group">
            <div className="text-4xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{s.v}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest my-2">{s.l}</div>
            <div className="text-xs text-slate-300 font-medium">{s.d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* == ROLES (Platform) ================================================= */
function Roles() {
  const ROLES = [
    { id: "S", title: "Student Console", desc: "Access live telemetry, AI-predicted ETAs, and smart notifications for your stopping point.", icon: "🛰️", links: ["Live Location", "Smart ETA", "Boarding Ticket"], color: "emerald", href: "/login?role=student" },
    { id: "D", title: "Driver Terminal", desc: "Broadcast precision coordinates, manage route status, and access neural safety monitoring.", icon: "🎮", links: ["GPS Uplink", "Trip Log", "Safety Sync"], color: "teal", href: "/login?role=driver" },
    { id: "A", title: "Admin Core", desc: "Oversee fleet logistics, assign tactical routes, and audit architectural performance telemetry.", icon: "⚡", links: ["Fleet Manager", "Route CRUD", "RAG Indexer"], color: "slate", href: "/login?role=admin" },
  ];

  return (
    <section id="platform" className="py-32 bg-slate-50 relative transition-colors duration-1000">
       <div className="max-w-7xl mx-auto px-6">
          <div className="mb-20 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900">Unified <span className="text-emerald-600">Ecosystem.</span></h2>
            <p className="text-slate-500 font-medium mt-4">Three specialized interfaces. One centralized neural link.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {ROLES.map((role, i) => (
              <div key={i} className="group bg-white border border-slate-100 p-10 rounded-[2.5rem] hover:shadow-2xl transition-all hover:-translate-y-4">
                 <div className="text-4xl mb-8 group-hover:scale-125 transition-transform duration-500">{role.icon}</div>
                 <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-600 mb-4">{role.title}</h3>
                 <p className="text-slate-500 text-sm leading-relaxed mb-10">{role.desc}</p>
                 <div className="space-y-4 mb-10">
                    {role.links.map(l => (
                      <div key={l} className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {l}
                      </div>
                    ))}
                 </div>
                 <Link href={role.href} className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase tracking-widest group-hover:gap-4 transition-all">
                    Initialize Phase →
                 </Link>
              </div>
            ))}
          </div>
       </div>
    </section>
  );
}

/* == INTERACTIVE FEATURES ============================================ */
function InteractiveFeatures() {
  return (
    <section className="py-32 bg-white px-6">
       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
             <div className="w-20 h-2 bg-emerald-600 mb-8" />
             <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 leading-none italic">
                SMART<br/>
                PREDICTION.
             </h2>
             <p className="text-xl text-slate-500 font-medium leading-relaxed mb-12">
                Our RAG-enhanced AI doesn't just track; it predicts. By analyzing historical load, traffic, and fleet telemetry, we offer 98% accurate delay estimation.
             </p>
             <div className="grid grid-cols-2 gap-8">
                <div>
                   <div className="text-3xl font-black text-emerald-600">AI-Core</div>
                   <p className="text-xs uppercase font-black text-slate-400 tracking-widest mt-2">OpenAI-RAG Synergy</p>
                </div>
                <div>
                   <div className="text-3xl font-black text-emerald-600">RT-Sync</div>
                   <p className="text-xs uppercase font-black text-slate-400 tracking-widest mt-2">Socket.IO Broadcast</p>
                </div>
             </div>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="absolute -inset-10 bg-emerald-100 blur-[100px] opacity-50 rounded-full" />
             <div className="bg-slate-900 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group">
                <img 
                  src="/soft_green_transit_bg_1776352625122.png" 
                  className="w-full h-full object-cover rounded-[2.5rem] filter grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                  alt="Feature Viz"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-500">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">🤖</div>
                         <div>
                            <div className="text-sm font-bold">SmartTransit AI</div>
                            <div className="text-[10px] text-slate-400">Processing Route #42B</div>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <div className="h-1 bg-slate-100 rounded-full w-48" />
                         <div className="h-1 bg-slate-100 rounded-full w-32" />
                         <div className="h-1 bg-emerald-500 rounded-full w-40" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

/* == FEATURE SHOWCASE ================================================ */
function FeatureShowcase() {
  const list = [
    { icon: "🌍", t: "Live Matrix", d: "High-frequency GPS synchronization across all fleet units." },
    { icon: "🛡️", t: "Fatigue Hub", d: "Computer vision monitoring to ensure driver alertness." },
    { icon: "🎫", t: "Digital Pass", d: "QR-based boarding with zero-contact manifest logging." },
    { icon: "💬", t: "AI Analyst", d: "Talk to your transit data. Ask about routes, delays, and trends." },
  ];

  return (
    <section id="features" className="py-32 px-6 bg-slate-50 perspective-1000">
       <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-20 italic">The <span className="text-emerald-600 underline">Standard</span> of Mobility.</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {list.map((item, i) => (
                <div key={i} className="bg-white border border-slate-100 p-8 rounded-3xl hover:border-emerald-300 transition-all shadow-sm hover:shadow-xl">
                   <div className="text-4xl mb-6">{item.icon}</div>
                   <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tighter">{item.t}</h3>
                   <p className="text-slate-400 text-sm leading-relaxed">{item.d}</p>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
}

/* == LIVE DEMO ======================================================= */
function LiveDemoSection() {
  const [pos, setPos] = useState(20);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setPos(p => p >= 100 ? 0 : p + 0.1), 100);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section id="demo" className="py-32 bg-white px-6">
       <div className="max-w-6xl mx-auto">
          <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500 text-black px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse">
                   Simulating Live Sync
                </div>
             </div>
             
             <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                   <h2 className="text-5xl md:text-7xl font-black text-white italic leading-tight">Watch the <br/> Neural Link.</h2>
                   <p className="text-slate-400 text-lg font-medium leading-relaxed">
                      This is a live look at how our backend processes bus positions. Every node update is pushed to thousands of devices in under 200ms.
                   </p>
                   <button onClick={() => setPaused(!paused)} className="px-10 py-5 rounded-2xl bg-white text-black font-black hover:bg-emerald-400 active:scale-95 transition-all">
                      {paused ? "Resume Sync" : "Pause Operations"}
                   </button>
                </div>
                
                <div className="relative h-[300px] bg-slate-800 rounded-[3rem] p-10 flex flex-col justify-center border border-white/5">
                   {/* Track */}
                   <div className="relative h-1 bg-white/10 rounded-full">
                      <div className="absolute inset-y-0 left-0 bg-emerald-400 shadow-[0_0_15px_#34d399] transition-all" style={{ width: `${pos}%` }} />
                      
                      {/* Stops */}
                      {[10, 40, 70, 95].map(s => (
                        <div key={s} className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-colors ${pos > s ? "bg-emerald-400 border-emerald-400" : "bg-slate-900 border-white/20"}`} style={{ left: `${s}%` }} />
                      ))}

                      {/* Bus */}
                      <div className="absolute top-1/2 -translate-y-1/2 transition-all -ml-6" style={{ left: `${pos}%` }}>
                         <div className="bg-white text-black text-[8px] font-black px-2 py-1 rounded-sm mb-4 text-center whitespace-nowrap">BUS_04B SPEED: 32</div>
                         <div className="w-12 h-6 bg-emerald-400 rounded-md shadow-[0_0_30px_#34d399]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </section>
  );
}

/* == TECH STACK ======================================================= */
function TechStack() {
  const list = ["Next.js", "GSAP", "Socket.IO", "OpenAI", "MongoDB", "Redis", "Framer Motion", "Tailwind"];
  return (
    <section className="py-20 bg-slate-50 border-y border-slate-100 overflow-hidden">
       <div className="flex animate-scroll gap-20 whitespace-nowrap">
          {[...list, ...list, ...list].map((t, i) => (
            <span key={i} className="text-5xl font-black text-slate-200 uppercase tracking-tighter hover:text-emerald-500 transition-colors cursor-default">{t}</span>
          ))}
       </div>
       <style jsx>{`
         .animate-scroll {
           animation: scroll 40s linear infinite;
         }
         @keyframes scroll {
           0% { transform: translateX(0); }
           100% { transform: translateX(-50%); }
         }
       `}</style>
    </section>
  );
}

/* == TESTIMONIALS ==================================================== */
function Testimonials() {
  const reviews = [
    { n: "Kirithick", r: "The ETA prediction is scarily accurate. Saves me 20 minutes every morning.", i: "K" },
    { n: "P. Venkateswaralu", r: "The most professional campus app I've ever used. UX is incredible.", i: "PV" },
    { n: "Nithya", r: "Safety monitoring for drivers gives me peace of mind when traveling early.", i: "N" },
  ];

  return (
    <section className="py-32 px-6 bg-white">
       <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
             {reviews.map((t, i) => (
                <div key={i} className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 hover:-translate-y-2 transition-all duration-500">
                   <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black">{t.i}</div>
                      <div>
                         <div className="font-black text-slate-900">{t.n}</div>
                         <div className="text-emerald-600 text-[10px] font-black uppercase tracking-widest italic">Verified Passenger</div>
                      </div>
                   </div>
                   <p className="text-slate-500 font-medium italic leading-relaxed">"{t.r}"</p>
                </div>
             ))}
          </div>
       </div>
    </section>
  );
}

/* == CONTACT ========================================================= */
function Contact() {
  return (
    <section id="contact" className="py-32 bg-slate-900 text-white px-6 relative overflow-hidden">
       <div className="absolute inset-0 bg-emerald-900/10 blur-[150px] translate-y-full" />
       
       <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 relative z-10">
          <div className="lg:w-2/5 space-y-10">
             <div className="w-20 h-2 bg-emerald-500" />
             <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic uppercase leading-none">Get In<br/>Touch.</h2>
             <p className="text-slate-400 text-xl font-medium leading-relaxed">
                Ready to deploy the SmartTransit grid in your campus? Let's connect and modernize your fleet.
             </p>
             <div className="space-y-6">
                <div>
                   <div className="text-[10px] uppercase font-black tracking-[0.4em] text-emerald-500 mb-2">Protocol_Email</div>
                   <div className="text-2xl font-black">hello@smarttransit.app</div>
                </div>
                <div>
                   <div className="text-[10px] uppercase font-black tracking-[0.4em] text-emerald-500 mb-2">Technical_Support</div>
                   <div className="text-2xl font-black">support@smarttransit.app</div>
                </div>
             </div>
          </div>

          <div className="lg:w-3/5 bg-white/5 border border-white/10 backdrop-blur-3xl p-12 lg:p-20 rounded-[4rem]">
             <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                   <label className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-3 block">Full_Name</label>
                   <input type="text" className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 outline-none focus:border-emerald-500 transition-all font-bold" placeholder="Your Name" />
                </div>
                <div>
                   <label className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-3 block">Node_Email</label>
                   <input type="email" className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 outline-none focus:border-emerald-500 transition-all font-bold" placeholder="your@edu.org" />
                </div>
             </div>
             <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 mb-3 block">Uplink_Message</label>
                <textarea className="w-full bg-black/20 border border-white/10 rounded-2xl p-5 outline-none focus:border-emerald-500 transition-all font-bold h-40 resize-none" placeholder="Explain your mission..." />
             </div>
             <button className="w-full mt-10 py-6 bg-emerald-600 text-black font-black uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-all shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                Send Transmission →
             </button>
          </div>
       </div>
    </section>
  );
}

/* == CTA ============================================================= */
function CTA() {
  return (
    <section className="py-40 bg-white px-6 text-center">
       <div className="max-w-4xl mx-auto space-y-12">
          <h2 className="text-5xl md:text-[6rem] font-black tracking-tighter italic leading-[0.85] text-slate-900">
             The Future of <span className="text-emerald-600">Transit</span> Is Calling.
          </h2>
          <Link href="/login?role=student" className="inline-block px-14 py-6 bg-slate-900 text-white font-black text-xl italic uppercase tracking-widest rounded-full hover:bg-emerald-600 transition-all shadow-2xl shadow-emerald-600/20 active:scale-95">
             Authorize Deployment →
          </Link>
          <div className="flex items-center justify-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Ready for Operational Phase</span>
          </div>
       </div>
    </section>
  );
}

/* == FOOTER ========================================================== */
function Footer() {
  return (
    <footer className="py-20 bg-slate-50 border-t border-slate-100 px-6">
       <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
             <div className="text-3xl font-black tracking-tighter mb-2">Smart<span className="text-emerald-600">Transit</span></div>
             <p className="text-slate-400 text-sm font-medium">© 2026 SmartTransit. Strategic Fleet Operations Group.</p>
          </div>
          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
             <a href="#" className="hover:text-emerald-600 transition-colors">Platform</a>
             <a href="#" className="hover:text-emerald-600 transition-colors">Features</a>
             <a href="#" className="hover:text-emerald-600 transition-colors">Contact</a>
          </div>
       </div>
    </footer>
  );
}
