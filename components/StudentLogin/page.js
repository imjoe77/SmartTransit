"use client";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { 
  LogIn, Bot, GraduationCap, ShieldCheck, 
  MapPinned, Navigation2, Activity, Zap, 
  Terminal, Globe, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function TransitPortal() {
  const text = "WELCOME_NODE_ACK";
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    let currentLength = 0;
    let interval;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        currentLength++;
        if (currentLength <= text.length) {
          setDisplayText(text.substring(0, currentLength));
        } else {
          clearInterval(interval);
          setShowCursor(false);
        }
      }, 70);
    }, 1200);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-[#dee2e6] relative font-sans flex flex-col items-center justify-center p-6 overflow-hidden"
    >
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 grayscale contrast-[1.2] opacity-10">
         <img 
            src="https://media.gettyimages.com/id/1417666173/photo/junior-high-students-wait-at-school-bus-stop.jpg?s=612x612&w=0&k=20&c=zQ15R3tg-aTqVQZOiGh7VmXpdYprAiwJtJwKQJrV1AE=" 
            alt="" 
            className="w-full h-full object-cover"
         />
      </div>
      <div className="absolute top-0 left-0 w-full h-[6px] bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] z-20" />

      {/* PORTAL CONSOLE */}
      <div className="relative z-10 w-full max-w-lg space-y-12 text-center animate-[slideUp_0.8s_ease-out]">
         
         {/* HEADER UNIT */}
         <div className="space-y-6">
            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden group">
               <Bot className="text-emerald-500 relative z-10" size={40} />
               <div className="absolute inset-0 bg-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            </div>
            <div>
               <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">SmartTransit</h1>
               <div className="flex items-center justify-center gap-3 bg-[#cbd5e0] border-2 border-slate-400/50 w-fit mx-auto px-4 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Secure Terminal Link</p>
               </div>
            </div>
         </div>

         {/* ACCESS CARD */}
         <div className="bg-[#cbd5e0] border-4 border-slate-400 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-slate-900/5 pointer-events-none group-hover:bg-transparent transition-all" />
            
            <div className="relative z-10">
               <div className="mb-10 min-h-[40px]">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight flex justify-center items-center gap-1">
                     {displayText}
                     {showCursor && <span className="w-[3px] h-6 bg-emerald-600 animate-pulse ml-1" />}
                  </h2>
               </div>

               <div className="space-y-4 mb-10">
                  <AuthButton 
                     onClick={() => signIn("google", { callbackUrl: "/studenthome" })}
                     icon={<Globe size={20} />}
                     label="Node Access via Google"
                  />
                  <AuthButton 
                     onClick={() => signIn("github", { callbackUrl: "/studenthome" })}
                     icon={<Terminal size={20} />}
                     label="Credential Link via GitHub"
                  />
               </div>

               <div className="pt-8 border-t border-slate-400/60 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-3 text-slate-500">
                     <ShieldCheck size={16} />
                     <p className="text-[10px] font-black uppercase tracking-widest leading-none">Identity Sync Protocol Active</p>
                  </div>
               </div>
            </div>
            
            <Navigation2 className="absolute -left-12 -bottom-12 w-48 h-48 opacity-[0.03] text-slate-900 rotate-12" />
         </div>

         {/* SUBTEXT FOOTER */}
         <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em]">Establish Secure Path Linkage</p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}

function AuthButton({ onClick, icon, label }) {
   return (
      <button 
         onClick={onClick}
         className="w-full bg-slate-900 hover:bg-slate-800 text-emerald-500 px-6 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-between border-b-8 border-slate-950 group"
      >
         <span className="flex items-center gap-4">
            <div className="group-hover:rotate-12 transition-transform">{icon}</div>
            {label}
         </span>
         <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
      </button>
   );
}