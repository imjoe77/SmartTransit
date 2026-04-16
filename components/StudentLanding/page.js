"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { 
  ArrowRight, Map, BusFront, ShieldCheck, Ticket, 
  GraduationCap, Bot, LogIn, LogOut, User,
  Activity, MapPinned, Navigation2, Zap, Smartphone, ChevronDown
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";

export default function StudentLanding({ session }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);

  // Sync state with local storage for demo if session object is missing (fallback)
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
      const tl = gsap.timeline();
      gsap.set(curtainsRef.current, { height: "100%" });
      gsap.set(textRefs.current, { y: 40, opacity: 0 });
      gsap.set(imageRef.current, { scale: 1.1, opacity: 0 });
      gsap.set(cardsRef.current, { opacity: 0, y: 100 });

      if (curtainsRef.current?.length) tl.to(curtainsRef.current, { height: "0%", duration: 1, ease: "power4.inOut", stagger: 0.1 });
      if (imageRef.current) tl.to(imageRef.current, { scale: 1, opacity: 1, duration: 1.5, ease: "power2.out" }, "-=0.5");
      if (textRefs.current?.length) tl.to(textRefs.current, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 }, "-=1.2");
      if (cardsRef.current) tl.to(cardsRef.current, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=0.6");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const navLinks = [
    
    { label: "Live Tracking", href: "/tracking" },
    { label: "Chat", href: "/chat" },
    { label: "Route", href: "/route" },
    { label: "Profile", href: "/profile" },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-slate-950 text-white overflow-hidden font-sans selection:bg-emerald-500">
      
      {/* STUDY HERO BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <img 
          ref={imageRef}
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Library Background"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1px]" />
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

      {/* REFINED HEADER (Screen Match) */}
      <header className="relative z-[60] px-12 py-8 flex justify-between items-center max-w-[1600px] mx-auto">
        <div className="flex items-center gap-2 group">
          <GraduationCap className="w-8 h-8 text-white group-hover:rotate-12 transition-transform duration-500" />
          <h1 className="font-bold text-2xl tracking-tighter text-white">SmartTransit</h1>
        </div>

        <nav className="hidden lg:flex items-center gap-10">
          <div className="flex gap-8 border-r border-white/10 pr-10">
            {navLinks.map((item, idx) => (
              <Link key={idx} href={item.href} className="text-sm font-semibold text-white/90 hover:text-emerald-400 transition-colors tracking-wide">
                {item.label}
              </Link>
            ))}
          </div>

          <div className="relative">
             <button 
                onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                className="flex items-center gap-4 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-2xl border border-white/10 transition-all group"
             >
                {activeUser ? (
                   <>
                      <Avatar className="w-8 h-8 border border-emerald-400">
                         <AvatarImage src={activeUser.image} />
                         <AvatarFallback className="bg-emerald-500 text-slate-900 font-bold">{activeUser.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-black text-white">{activeUser.name || "User"}</span>
                   </>
                ) : (
                   <>
                      <User className="text-emerald-400" size={20} />
                      <span className="text-sm font-black text-white">Guest Log-In</span>
                   </>
                )}
                <ChevronDown className={cn("w-4 h-4 transition-transform", loginDropdownOpen && "rotate-180")} />
             </button>

             {loginDropdownOpen && (
                <div className="absolute top-full right-0 mt-4 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl animate-[slideDown_0.3s_ease-out]">
                   {!activeUser ? (
                      <>
                         <DropdownLink href="/login?role=student" icon={<GraduationCap size={16} />} label="Student Access" color="text-blue-400" />
                         <DropdownLink href="/login?role=driver" icon={<BusFront size={16} />} label="Driver Console" color="text-emerald-400" />
                         <DropdownLink href="/login?role=admin" icon={<ShieldCheck size={16} />} label="Admin Terminal" color="text-amber-400" />
                      </>
                   ) : (
                      <>
                         <DropdownLink href="/profile" icon={<User size={16} />} label="My Profile" color="text-blue-400" />
                         <DropdownLink href="/api/auth/signout" icon={<LogOut size={16} />} label="Disconnect" color="text-red-400" />
                      </>
                   )}
                </div>
             )}
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex flex-col items-start justify-center min-h-[85vh] px-12 lg:px-24 max-w-[1600px] mx-auto">
         <div className="max-w-4xl space-y-12">
            <div className="space-y-4">
               <div className="overflow-hidden">
                  <h1 ref={addToTextRefs} className="text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter">
                     NEVER MISS
                  </h1>
               </div>
               <div className="overflow-hidden">
                  <h1 ref={addToTextRefs} className="text-8xl lg:text-[10rem] font-black leading-[0.8] tracking-tighter text-emerald-400">
                     YOUR CLASS.
                  </h1>
               </div>
            </div>

            <div className="overflow-hidden max-w-2xl">
               <p ref={addToTextRefs} className="text-xl lg:text-2xl text-white/70 font-medium leading-[1.6]">
                  Real-time tracking, pinpoint ETAs, and AI-powered route assistance. SmartTransit eliminates the wait and puts your college commute on autopilot.
               </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-6 overflow-hidden">
               <div ref={addToTextRefs} className="flex flex-wrap gap-6">
                  <button 
                     onClick={handleStudentLoginClick}
                     className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-12 py-5 rounded-full font-black text-lg flex items-center gap-4 transition-all shadow-2xl shadow-emerald-500/20 group active:scale-[0.98]"
                  >
                     Go to Dashboard <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <Link 
                     href="/chat"
                     className="bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/20 px-12 py-5 rounded-full font-black text-lg flex items-center gap-4 transition-all text-white group"
                  >
                     Ask AI Assistant <Bot className="group-hover:rotate-12 transition-transform" />
                  </Link>
               </div>
            </div>
         </div>
      </main>

      {/* GLASS UTILITY CARDS */}
      <div ref={cardsRef} className="relative z-10 px-12 lg:px-24 pb-16 max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
         <UtilityCard icon={<MapPinned />} title="Live Hub" desc="Precise bus positioning." />
         <UtilityCard icon={<Zap />} title="AI Oracle" desc="Smart delay predictions." />
         <UtilityCard icon={<Smartphone />} title="Digital Pass" desc="Fast terminal check-in." />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

function DropdownLink({ href, icon, label, color }) {
   return (
      <Link href={href} className="w-full flex items-center gap-4 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white rounded-2xl transition-all">
         <span className={color}>{icon}</span> {label}
      </Link>
   );
}

function UtilityCard({ icon, title, desc }) {
   return (
      <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 flex items-center gap-8 hover:bg-white/10 transition-all group relative overflow-hidden">
         <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 relative z-10">
            {icon}
         </div>
         <div className="relative z-10">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{title}</h3>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mt-1">{desc}</p>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mt-10 -mr-10" />
      </div>
   );
}