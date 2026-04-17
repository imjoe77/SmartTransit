"use client";
import { useState } from "react";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function AdminLogin() {
  const [token, setToken] = useState("");
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = (e) => {
    e.preventDefault();
    // Maintain OAuth functionality with callback to /admin
    signIn("google", { callbackUrl: "/adminhome" });
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden isolate flex items-center justify-center bg-[#020617] text-gray-200">

      {/* 🌌 BACKGROUND */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80')",
        }}
      />

      {/* GRID */}
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(6,182,212,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* SCANLINE */}
      <div className="absolute inset-0 pointer-events-none z-10 opacity-30 overflow-hidden">
        <div className="w-full h-32 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent animate-[scanline_8s_linear_infinite]" />
      </div>

      {/* VIGNETTE */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#020617]/70 to-[#020617]" />

      {/* MAIN */}
      <div className="relative z-20 w-full max-w-lg px-4 animate-[fadeInScale_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]">

        {/* HEADER */}
        <div className="mb-10 text-center">

          <div className="inline-flex items-center justify-center p-4 rounded-full bg-cyan-950/40 border border-cyan-800/50 backdrop-blur-md mb-6 relative group">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 group-hover:bg-cyan-500/40 blur-xl transition-all duration-500"></div>
            🔐
          </div>

          <h1 className="text-4xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase mb-3">
            Administration Login
          </h1>

          <div className="flex items-center justify-center gap-2 text-xs text-cyan-500 uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
            Safe Secure Login System _
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 backdrop-blur-md animate-bounce">
            <p className="text-red-400 text-sm font-bold text-center uppercase tracking-widest">
              ⚠️ Unauthorized Identity Detected
            </p>
            <p className="text-red-500/80 text-[10px] text-center mt-1 uppercase">
              Access Denied for this sector
            </p>
          </div>
        )}

        {/* FORM */}
        <div className="relative rounded-2xl bg-[#0b1227]/70 backdrop-blur-3xl p-8 border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)]">

          {/* CYBER BORDER */}
          <div className="absolute inset-0 rounded-2xl p-[2px] pointer-events-none [background:linear-gradient(135deg,rgba(6,182,212,0.8),transparent,rgba(139,92,246,0.5))] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude]" />

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >

            {/* INPUT */}
            <div>
              <label className="block text-xs text-cyan-300 uppercase mb-2 tracking-widest">
                Admin Identity / Token
              </label>

              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-4 rounded-xl bg-[#06102a]/60 border border-cyan-800/40 text-cyan-100 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-500 outline-none"
              />
            </div>

            {/* ✅ FIXED BUTTON (NO GLITCH) */}
            <button
              type="submit"
              className="group relative overflow-hidden w-full py-4 rounded-xl font-bold uppercase bg-gradient-to-r from-cyan-600 to-indigo-600 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition"
            >
              {/* SAFE SHINE EFFECT */}
              <span className="absolute inset-0 translate-x-[-100%] bg-white/20 group-hover:translate-x-[100%] transition-transform duration-700"></span>

              <span className="relative z-10 group-hover:scale-105 transition">
                Login with Google
              </span>
            </button>

          </form>

          {/* FOOT */}
          <div className="mt-6 text-center border-t border-cyan-500/20 pt-4">
            <span className="text-xs text-indigo-400">
              Request Emergency Access
            </span>
          </div>
        </div>

        {/* SYSTEM TEXT */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-cyan-600 tracking-widest">
            SYS.V.4.2 // ENCRYPTED HANDSHAKE REQUIRED
          </p>
        </div>
      </div>

      {/* 🎬 ANIMATIONS */}
      <style jsx global>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
