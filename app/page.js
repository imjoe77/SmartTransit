import { getSafeAuthSession } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BusFront, ArrowRight, User, Terminal, ShieldCheck, Cpu } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default async function Home() {
  const session = await getSafeAuthSession();

  // Redirect authenticated users to their specific universes
  if (session?.user?.role === "driver") {
    redirect("/driverhome");
  }
  if (session?.user?.role === "student") {
    redirect("/studenthome");
  }
  if (session?.user?.role === "admin") {
    redirect("/adminhome");
  }

  // Guest view - Master Portal
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center font-mono relative overflow-hidden">
       
       {/* Background Aesthetic */}
       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#39FF14]/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#39FF14]/20 to-transparent" />
       </div>

       <div className="relative z-10 w-full max-w-6xl">
          <div className="w-16 h-16 bg-[#39FF14]/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-[#39FF14]/20">
             <BusFront className="text-[#39FF14] w-8 h-8" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
             Smart<span className="text-[#39FF14]">Transit</span>
          </h1>
          
          <p className="text-white/40 max-w-md mx-auto text-[10px] font-black uppercase tracking-[0.4em] mb-16 leading-relaxed">
             Global Transport Logistics Neural Grid.<br/>
             Select Operational Protocol to Continue.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <RoleCard 
                icon={<User size={32} />} 
                title="Student Hub" 
                desc="Live tracking, route analytics, and boarding sync." 
                href="/login?role=student"
                label="Initialize_Student"
             />
             <RoleCard 
                icon={<Terminal size={32} />} 
                title="Driver Terminal" 
                desc="Technical telemetry, mission protocol, and neural safety." 
                href="/login?role=driver"
                label="Launch_Driver_Ops"
                highlight
             />
             <RoleCard 
                icon={<ShieldCheck size={32} />} 
                title="Admin Console" 
                desc="Fleet compliance, RTO gateway, and master grid control." 
                href="/login?role=admin"
                label="Access_Command_Core"
             />
          </div>

          <div className="mt-20 flex justify-center items-center gap-10 opacity-20 grayscale">
             <div className="flex items-center gap-2"><Cpu size={14} /> <span className="text-[9px] font-black uppercase">v2.4_Stable</span></div>
             <div className="flex items-center gap-2"><Terminal size={14} /> <span className="text-[9px] font-black uppercase">Auth_Secure</span></div>
          </div>
       </div>
    </div>
  );
}

function RoleCard({ icon, title, desc, href, label, highlight }) {
   return (
      <Link href={href} className={cn(
         "group p-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center text-center space-y-6 relative overflow-hidden",
         highlight 
            ? "bg-[#39FF14]/5 border-[#39FF14]/30 hover:border-[#39FF14] shadow-[0_0_40px_rgba(57,255,20,0.1)] hover:shadow-[0_0_60px_rgba(57,255,20,0.2)]" 
            : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
      )}>
         <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500",
            highlight ? "bg-[#39FF14]/10 text-[#39FF14] group-hover:scale-110" : "bg-white/5 text-white/40 group-hover:text-white group-hover:scale-110"
         )}>
            {icon}
         </div>
         <div className="space-y-3">
            <h3 className="text-2xl font-black uppercase tracking-tight">{title}</h3>
            <p className="text-white/40 text-[11px] font-bold uppercase tracking-wider leading-relaxed">
               {desc}
            </p>
         </div>
         <div className="pt-4 w-full">
            <div className={cn(
               "w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
               highlight 
                  ? "bg-[#39FF14] text-black group-hover:bg-[#32e612]" 
                  : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white border border-transparent group-hover:border-white/20"
            )}>
               {label} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
         </div>
         
         {/* HUD Corner Decor */}
         <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-current opacity-10" />
         <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-current opacity-10" />
      </Link>
   );
}
