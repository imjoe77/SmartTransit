"use client";
import { Home, User, Bus, MapPin, Clock, AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function TransitTracking() {
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const sidebarRef = useRef(null);
  const topbarRef = useRef(null);
  const contentMapRef = useRef(null);
  const contentStopsRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      // Ensure elements exist before animating
      const elements = [sidebarRef.current, topbarRef.current, contentMapRef.current, contentStopsRef.current].filter(Boolean);
      const overlay = overlayRef.current;

      if (overlay) gsap.set(overlay, { yPercent: 0 });
      if (elements.length) gsap.set(elements, { opacity: 0, y: 30 });

      // Slide up the overlay (Barba-style page transition effect)
      if (overlay) {
        tl.to(overlay, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
          delay: 0.2, // Short duration "loading" state
        });
      }

      // Stagger in the UI elements
      if (elements.length) {
        tl.to(
          elements,
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.6"
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* TRANSITION OVERLAY */}
      <div 
        ref={overlayRef} 
        className="fixed inset-0 bg-blue-950 z-50 flex items-center justify-center pointer-events-none"
      >
        <div className="flex flex-col items-center gap-4 text-white">
          <Bus size={48} className="animate-bounce" />
          <h2 className="text-3xl font-extrabold tracking-widest uppercase">Student Transit</h2>
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-blue-500 w-full animate-[progress_1.2s_ease-in-out]" style={{ transformOrigin: 'left' }} />
          </div>
        </div>
      </div>

      <div 
        className="min-h-screen flex font-sans bg-cover bg-center bg-fixed relative text-slate-800"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2070')" }}
      >
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"></div>

        {/* SIDEBAR */}
        <div ref={sidebarRef} className="relative z-10 hidden md:flex w-64 flex-col p-4 bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-2xl text-white">
          <h2 className="font-extrabold text-2xl mb-8 tracking-wider text-white drop-shadow-md">SmartTransit</h2>

          <NavItem icon={<Home />} label="Dashboard" />
          <NavItem icon={<User />} label="Profile" />
          <NavItem icon={<Bus />} label="Transit" active />
        </div>

        {/* MAIN */}
        <div className="relative z-10 flex-1 flex flex-col h-screen overflow-y-auto">

          {/* TOPBAR */}
          <div ref={topbarRef} className="sticky top-0 bg-white/10 backdrop-blur-xl border-b border-white/10 px-8 py-4 flex justify-between items-center z-20">
            <h1 className="font-bold text-2xl text-white drop-shadow-md">Live Transit Tracking</h1>
            <input
              placeholder="Search Routes..."
              className="px-5 py-2.5 rounded-full bg-black/20 border border-white/20 text-white placeholder-white/50 outline-none focus:bg-black/40 focus:border-blue-400 transition-all shadow-inner w-64"
            />
          </div>

          {/* CONTENT */}
          <div className="p-8 space-y-8 max-w-6xl mx-auto w-full pb-20">
            
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* LARGE MAP SECTION */}
              <div ref={contentMapRef} className="md:col-span-2 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative flex flex-col hover:border-white/30 transition-colors h-[550px]">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="flex items-center gap-2 px-3 py-1 text-xs font-bold bg-blue-500 text-white rounded-full shadow-sm mb-2 w-max animate-pulse">
                      <Clock size={12}/> LIVE GPS
                    </span>
                    <h4 className="font-bold text-2xl text-white">Route #42B - Campus Loop</h4>
                    <p className="text-sm text-blue-200 font-medium">To: Science Quad</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-extrabold text-cyan-300">4<span className="text-xl">min</span></p>
                    <p className="text-xs text-white/60 uppercase tracking-widest mt-1">ETA to Your Stop</p>
                  </div>
                </div>

                <div className="flex-1 rounded-2xl overflow-hidden shadow-inner relative border border-white/10 group cursor-pointer">
                  <img
                    src="https://maps.googleapis.com/maps/api/staticmap?center=university+campus&zoom=16&size=800x600&style=feature:all|element:labels|visibility:off&style=element:geometry|color:0x242f3e"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                    alt="Map view"
                  />
                  <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white p-3 rounded-full shadow-[0_0_30px_rgba(59,130,246,1)] z-10">
                    <Bus size={30} className="animate-bounce" />
                  </div>
                  {/* Faux map pins */}
                  <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]" />
                  <div className="absolute top-2/3 left-2/3 w-3 h-3 bg-white/50 rounded-full" />
                </div>
              </div>

              {/* TIMELINE & STOPS */}
              <div ref={contentStopsRef} className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col text-white h-[550px]">
                <h4 className="font-bold text-xl mb-6 flex items-center gap-2"><MapPin className="text-blue-400"/> Next Stops</h4>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div><StopItem name="Science Faculty" status="Passed 2m ago" /></div>
                  <div><StopItem name="Central Library" status="Arriving Now" highlight /></div>
                  <div><StopItem name="Dormitory Gate" status="ETA 6 mins" /></div>
                  <div><StopItem name="Stadium" status="ETA 12 mins" /></div>
                  <div><StopItem name="North Campus Dorms" status="ETA 19 mins" /></div>
                  <div><StopItem name="Student Union" status="ETA 25 mins" /></div>
                </div>

                <div className="mt-4 p-4 bg-orange-500/20 border border-orange-500/30 rounded-2xl flex items-start gap-3 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-orange-400/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                  <AlertCircle className="text-orange-400 shrink-0 relative z-10" />
                  <p className="text-sm font-medium text-orange-200 relative z-10">Traffic delay reported near Main Gate. Expect +2 mins on ETA.</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function NavItem({ icon, label, active }) {
  return (
    <div className={`flex items-center gap-4 px-5 py-3 rounded-xl cursor-pointer transition-all duration-300 ${active ? "bg-blue-500/20 border border-blue-400/30 font-bold shadow-[0_0_15px_rgba(59,130,246,0.2)] text-blue-100" : "hover:bg-white/10 text-white/70 hover:text-white"}`}>
      <span className={active ? "text-blue-400" : ""}>{icon}</span>
      <span className="text-lg">{label}</span>
    </div>
  );
}

function StopItem({ name, status, highlight }) {
  return (
    <div className="flex items-stretch gap-4 group">
      <div className="relative flex flex-col items-center pt-2">
        <div className={`w-3 h-3 rounded-full border-2 z-10 transition-colors ${highlight ? "bg-blue-400 border-blue-300 shadow-[0_0_15px_rgba(96,165,250,1)]" : "bg-transparent border-white/40 group-hover:bg-white/20"}`} />
        <div className="w-[1px] h-full bg-gradient-to-b from-white/20 to-transparent absolute top-5 -bottom-4" />
      </div>
      <div className={`flex-1 p-4 rounded-2xl border transition-all duration-300 ${highlight ? "bg-blue-500/20 border-blue-400/30 shadow-lg" : "bg-black/10 border-white/5 hover:bg-white/5"}`}>
        <p className={`font-bold transition-colors ${highlight ? "text-white text-lg" : "text-white/80"}`}>{name}</p>
        <p className={`text-xs mt-1 transition-colors ${highlight ? "text-blue-200" : "text-white/40"}`}>{status}</p>
      </div>
    </div>
  );
}
