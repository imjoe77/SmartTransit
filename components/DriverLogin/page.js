"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function DriverLogin() {
  const [slide, setSlide] = useState(0);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="h-[100dvh] w-full relative overflow-hidden isolate bg-slate-900 text-white">

      {/* 🌌 BACKGROUND (fixed bounds) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center animate-[kenBurns_30s_ease-in-out_infinite_alternate]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80')",
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-[1px]" />

      {/* LEFT SIDE */}
      <div className="absolute top-20 left-20 hidden lg:block w-1/2 z-10">
        <h1 className="text-[4rem] font-bold uppercase tracking-[0.15em] leading-tight">
          <div className="overflow-hidden">
            <div className="animate-[slideUpReveal_0.9s_ease_forwards]">
              DRIVER
            </div>
          </div>
          <div className="overflow-hidden">
            <div className="animate-[slideUpReveal_0.9s_ease_forwards_150ms]">
              OPERATIONS
            </div>
          </div>
        </h1>

        <p className="text-gray-300 mt-6 max-w-md animate-[slideUpReveal_0.9s_ease_forwards_300ms]">
          Authorized access point for Transit Flow fleet operators.
        </p>

        <div className="mt-6 animate-[slideUpReveal_0.9s_ease_forwards_450ms]">
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <span className="h-3 w-3 bg-orange-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase">
              Secure Dispatch Server
            </span>
          </div>
        </div>
      </div>

      {/* 🔐 RIGHT PANEL (no bleed, proper clip) */}
      <div className="absolute top-0 right-0 h-full w-full lg:w-[500px] overflow-hidden bg-black/40 backdrop-blur-xl border-l border-white/10 shadow-[-10px_0_40px_rgba(0,0,0,0.5)] z-20 animate-[slideInRight_1s_ease_forwards]">

        {/* VIEWPORT CLIP */}
        <div className="w-full h-full overflow-hidden flex flex-col">

          {/* ERROR ALERT */}
          {error && (
            <div className="mx-8 mt-12 p-4 rounded-xl bg-orange-500/10 border border-orange-500/50 backdrop-blur-md animate-pulse">
              <p className="text-orange-400 text-sm font-bold text-center uppercase tracking-widest">
                🚫 Driver Not Authorized
              </p>
              <p className="text-orange-500/80 text-[10px] text-center mt-1 uppercase">
                Email verification failed
              </p>
            </div>
          )}

          {/* SLIDER */}
          <div
            className="flex w-[200%] h-full transition-transform duration-700 ease-[cubic-bezier(0.87,0,0.13,1)]"
            style={{
              transform: slide === 1 ? "translateX(-50%)" : "translateX(0%)",
            }}
          >

            {/* 🧾 PANEL 1 */}
            <div className="w-1/2 shrink-0 flex flex-col justify-center px-8 py-12">

              <h2 className="text-3xl font-bold mb-2">Login.</h2>
              <p className="text-gray-300 mb-6 text-sm">
                Enter your Driver ID
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signIn("google", { callbackUrl: "/driverhome" });
                }}
                className="space-y-6"
              >
                <input
                  type="text"
                  placeholder="TR-8842"
                  required
                  className="w-full px-5 py-4 rounded-xl bg-white/10 border border-white/20 focus:border-orange-400 outline-none"
                />

                <button className="w-full bg-orange-500 hover:bg-orange-600 py-4 rounded-xl font-bold transition">
                  Continue
                </button>
              </form>

              <button
                onClick={() => setSlide(1)}
                className="mt-6 text-sm text-gray-300 hover:text-white transition"
              >
                Sign in with Google or GitHub →
              </button>
            </div>

            {/* 🌐 PANEL 2 */}
            <div className="w-1/2 shrink-0 flex flex-col justify-center px-8 py-12">

              <h2 className="text-3xl font-bold mb-2">SSO Verify.</h2>
              <p className="text-gray-300 mb-6 text-sm">
                Login via Google or GitHub
              </p>

              <button 
                onClick={() => signIn("google", { callbackUrl: "/driverhome" })}
                className="w-full bg-white text-black py-4 rounded-xl font-bold mb-4 hover:bg-gray-200 transition">
                Sign in with Google
              </button>

              <button 
                onClick={() => signIn("github", { callbackUrl: "/driverhome" })}
                className="w-full bg-black py-4 rounded-xl font-bold border border-white/10 hover:bg-gray-900 transition">
                Sign in with GitHub
              </button>

              <button
                onClick={() => setSlide(0)}
                className="mt-6 text-sm text-gray-300 hover:text-white transition"
              >
                ← Back
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 🎬 INTERNAL ANIMATIONS */}
      <style jsx global>{`
        @keyframes slideUpReveal {
          0% { transform: translateY(120%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes slideInRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
