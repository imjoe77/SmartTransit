"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, AlertCircle, Plus, MapPinned, History, Settings, TerminalSquare, Heart, Activity } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export default function ChatClient({ session }) {
  const [timeStr, setTimeStr] = useState("00:00 AM");

  useEffect(() => {
    setTimeStr(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  // --- Core Chat Logic ---
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Analyzing current transit nodes... Transit Intelligence active. How can I assist with your campus commute today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async (event) => {
    if (event) event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError("");
    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Chat failed");
      }
      const payload = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: payload.reply || "No response received." },
      ]);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setLoading(false);
    }
  };

  const faqHints = [
    "When does Bus 2 leave?",
    "Which bus goes to Library?",
    "Route 1 evening timings?",
    "Is the Green shuttle delayed?"
  ];

  return (
    <div className="h-screen w-screen bg-[#dee2e6] flex overflow-hidden font-sans text-slate-800">
      
      {/* === SIDEBAR (Dark Cool Slate) === */}
      <div className="w-72 hidden lg:flex flex-col bg-[#1a1c23] border-r border-[#2d2f39] shrink-0 text-slate-300 shadow-2xl z-20">
        
        {/* Branding */}
        <div className="h-20 flex items-center px-8 shrink-0 border-b border-[#2d2f39]">
           <Link href="/" className="font-black text-2xl text-white flex items-center gap-3 tracking-tighter hover:opacity-80 transition-opacity">
             <div className="text-emerald-500"><Bot size={28} /></div>
             CyberPulse
           </Link>
        </div>
        
        {/* Navigation Actions */}
        <div className="flex-1 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
           <div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Transit Intelligence</p>
             <button 
               onClick={() => setMessages([{ role: "assistant", content: "Session reset. New link established." }])}
               className="flex items-center gap-3 w-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-3 rounded-xl font-bold text-sm transition-all hover:bg-emerald-500/20 active:scale-95 mb-6 shadow-sm"
             >
                <Plus size={18} /> New Chat
             </button>
             
             <div className="space-y-1">
                <NavItem icon={<Heart size={18} />} label="Routes" href="/route" isDark active={false} />
                <NavItem icon={<History size={18} />} label="Dashboard" href="/" isDark active={false} />
                <NavItem icon={<Activity size={18} />} label="Profile" href="/profile" isDark active={false} />
                <NavItem icon={<MapPinned size={18} />} label="Live Map" href="/tracking" isDark active={false} />
             </div>
           </div>
        </div>
        
        {/* Upgrade Card */}
        <div className="p-6 shrink-0">
          <div className="bg-[#2d2f39] border border-[#3d404d] rounded-2xl p-5 group shadow-inner">
             <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
               <Sparkles size={12} /> Neural Upgrade
             </p>
             <p className="text-xs text-slate-400 mb-4 font-medium leading-relaxed font-sans opacity-80">Unlock real-time predictive navigation routing.</p>
             <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl py-2.5 text-xs font-black transition active:scale-95 shadow-md">
               Upgrade to Pro
             </button>
          </div>
          <div className="mt-4 flex items-center gap-2 px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-300 transition-colors">
            <Settings size={14} /> Settings
          </div>
        </div>
      </div>
      
      {/* === CHAT AREA (Sleek Matte Slate - NO WHITES) === */}
      <div className="flex-1 flex flex-col bg-[#dee2e6] overflow-hidden relative">
        
        {/* Top Info Bar */}
        <div className="h-20 flex justify-between items-center px-10 border-b border-[#cbd5e0] shrink-0 bg-[#dee2e6]/95 backdrop-blur-md z-10 w-full shadow-sm">
          <div className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 flex items-center gap-4">
             NEURAL LINK ESTABLISHED — {timeStr}
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[10px] font-black tracking-widest text-emerald-700 uppercase">
             <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span> SYSTEM LIVE
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-10 flex flex-col custom-scrollbar">
          {messages.map((item, index) => {
            const isUser = item.role === "user";
            
            if (isUser) {
              return (
                <div key={index} className="self-end max-w-[85%] md:max-w-[70%] w-fit animate-[slideUp_0.3s_ease-out] flex flex-col items-end">
                  <div className="bg-[#2d3436] text-slate-100 rounded-2xl rounded-tr-sm p-4 md:p-5 shadow-lg text-sm md:text-[15px] font-medium leading-relaxed whitespace-pre-wrap border border-slate-700">
                     {item.content}
                  </div>
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2 mr-1 opacity-70">Sent</div>
                </div>
              );
            }

            return (
              <div key={index} className="self-start w-full max-w-4xl animate-[slideUp_0.3s_ease-out]">
                <div className="flex items-center gap-2 text-emerald-700 font-black text-[10px] uppercase tracking-[0.2em] mb-4 pl-1">
                  <div className="bg-emerald-600 text-white p-1 rounded-md shadow-sm shadow-emerald-500/30"><Plus size={12} /></div> Assistant Pulse
                </div>
                <div className="text-slate-800 text-[15px] font-medium leading-relaxed mb-6 pl-1 whitespace-pre-wrap max-w-3xl">
                  {item.content}
                </div>
                {index === 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pl-1 animate-[slideUp_0.5s_ease-out]">
                    <div className="bg-[#cbd5e0]/40 border border-[#cbd5e0] p-4 rounded-xl shadow-sm backdrop-blur-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded uppercase font-sans">Fastest</span>
                        <span className="text-[10px] font-bold text-slate-600">14 min</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">HyperLoop Line 4</p>
                      <p className="text-[10px] text-slate-600 mt-1">Departing from Platform 8 in 2 mins</p>
                    </div>
                    <div className="bg-[#cbd5e0]/40 border border-[#cbd5e0] p-4 rounded-xl shadow-sm backdrop-blur-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-black bg-slate-500 text-white px-2 py-0.5 rounded uppercase font-sans">Alternate</span>
                        <span className="text-[10px] font-bold text-slate-600">22 min</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Rapid Transit 09</p>
                      <p className="text-[10px] text-slate-600 mt-1">High frequency service every 5 mins</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="self-start w-full max-w-3xl animate-[slideUp_0.3s_ease-out]">
              <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4 pl-1">
                <div className="bg-slate-400 text-white p-1 rounded-md"><Plus size={12} /></div> Assistant Pulse
              </div>
              <div className="flex gap-2 items-center pl-2 h-6">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              </div>
            </div>
          )}

          {error && (
            <div className="self-center flex items-center gap-2 px-6 py-3 bg-red-100 border border-red-200/50 text-red-600 text-xs font-bold rounded-xl shadow-sm">
               <AlertCircle size={14} /> {error}
            </div>
          )}
          
          <div ref={chatEndRef} className="h-4" />
        </div>

        {/* Bottom Input Section (Matte Slateified) */}
        <div className="px-6 md:px-10 pb-6 pt-4 bg-[#dee2e6] border-t border-[#cbd5e0] shrink-0">
          
          {/* FAQ Hints */}
          <div className="flex overflow-x-auto gap-2 mb-4 no-scrollbar justify-center">
            {faqHints.map((hint, idx) => (
              <button 
                key={idx}
                onClick={() => setMessage(hint)}
                className="whitespace-nowrap px-4 py-2 bg-[#cbd5e0]/60 border border-[#cbd5e0] rounded-full text-[11px] font-bold text-slate-600 hover:bg-emerald-600/10 hover:border-emerald-600 hover:text-emerald-700 transition-all shadow-sm shrink-0"
              >
                {hint}
              </button>
            ))}
          </div>

          <form 
            onSubmit={send}
            className="group relative flex items-center bg-[#cbd5e0]/30 border-2 border-[#cbd5e0] rounded-2xl p-1.5 transition-all focus-within:border-emerald-600/60 focus-within:bg-[#cbd5e0]/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.05)] shadow-inner"
          >
            <button disabled type="button" className="p-3 text-emerald-700 bg-emerald-600/10 rounded-xl ml-1 shadow-inner">
              <Sparkles size={20} />
            </button>
            <input 
              className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-slate-900 px-4 placeholder:text-slate-500/80 font-sans" 
              placeholder="Ask about transit, schedules, or your travel history..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              disabled={loading || !message.trim()}
              className="bg-emerald-600 disabled:bg-slate-400 disabled:text-slate-500 hover:bg-emerald-700 text-white p-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center mr-1"
            >
              <Send size={20} className={cn(loading && "animate-pulse")} />
            </button>
          </form>
          
          <p className="text-center mt-5 text-[9px] font-black uppercase tracking-[0.25em] text-slate-500/60 font-sans">
            AI CAN MAKE MISTAKES. VERIFY CRITICAL TRANSIT INFO.
          </p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function NavItem({ icon, label, active, href, isDark }) {
  return (
    <Link href={href || "#"} className="w-full block group">
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 font-bold text-sm",
        active 
          ? (isDark ? "bg-[#2d3436] text-white shadow-lg" : "bg-slate-200 text-slate-900 shadow-sm")
          : (isDark ? "text-slate-500 hover:bg-[#2d3436]/50 hover:text-slate-300" : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-800")
      )}>
        <div className={cn("transition-transform duration-200 group-hover:scale-110", active && "text-emerald-500")}>
          {icon}
        </div>
        <span className="tracking-wide">
          {label}
        </span>
      </div>
    </Link>
  );
}
