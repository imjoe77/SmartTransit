"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Eye, ShieldAlert, Activity, Power, RotateCcw, Zap, Camera, Lock, RefreshCcw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ANALYZE_INTERVAL_MS   = 1000;   
const CONSECUTIVE_THRESHOLD = 2;       
const ALERT_COOLDOWN_MS     = 60_000;  
const CAPTURE_WIDTH         = 1280; // Upgraded resolution for precision eye tracking

export default function FatigueMonitor({ busId, driverId, coordinates, tripActive }) {
  const videoRef        = useRef(null);
  const canvasRef       = useRef(null);
  const streamRef       = useRef(null);
  const intervalRef     = useRef(null);
  const consecutiveRef  = useRef(0);
  const lastAlertRef    = useRef(0);

  const [hasAuthorized, setHasAuthorized] = useState(false);
  const [cameraReady, setCameraReady]     = useState(false);
  const [cameraError, setCameraError]     = useState("");
  const [fatigueState, setFatigueState]   = useState("ok");     
  const [latestEar, setLatestEar]         = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState("idle"); 
  const [serviceRetries, setServiceRetries] = useState(0);

  const [alarmActive, setAlarmActive] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/alert.mp3");
      audio.loop = true;
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    if (fatigueState === "alert" && !alarmActive) {
      setAlarmActive(true);
    }
  }, [fatigueState, alarmActive]);

  useEffect(() => {
    if (alarmActive && audioRef.current) {
      audioRef.current.play().catch(err => console.warn("[Fatigue] Audio play failed:", err));
    } else if (!alarmActive && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [alarmActive]);

  const stopAlarm = () => {
    setAlarmActive(false);
    consecutiveRef.current = 0; 
    setFatigueState("ok");
  };

  const startCamera = useCallback(async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
           videoRef.current.play();
           setCameraReady(true);
           setHasAuthorized(true);
        };
      }
    } catch (err) {
      console.error("[Fatigue] Camera link failed:", err);
      setCameraReady(false);
      setCameraError(err.name === "NotAllowedError" ? "OS_PERMISSION_DENIED" : "HARDWARE_NOT_FOUND");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;

    const scale  = CAPTURE_WIDTH / video.videoWidth;
    canvas.width  = CAPTURE_WIDTH;
    canvas.height = Math.round(video.videoHeight * scale);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.7).split(",")[1];
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (!tripActive) return;

    const b64 = captureFrame();
    if (!b64) return;
    setAnalysisStatus("running");

    try {
      const res = await fetch("/api/safety/fatigue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: b64 }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setAnalysisStatus("service-down");
        return;
      }

      setServiceRetries(0);
      if (data.face_detected === false) {
        setAnalysisStatus("no-face");
        consecutiveRef.current = 0;
        setFatigueState("ok");
        return;
      }

      setLatestEar(data.ear);
      setAnalysisStatus("idle");

      if (data.fatigued) {
        consecutiveRef.current += 1;
      } else {
        consecutiveRef.current = 0;
        setFatigueState("ok");
      }

      if (consecutiveRef.current === 1) setFatigueState("warning");
      if (consecutiveRef.current >= CONSECUTIVE_THRESHOLD) {
        setFatigueState("alert");
        const now = Date.now();
        if (now - lastAlertRef.current > ALERT_COOLDOWN_MS) {
          lastAlertRef.current = now;
          await fetch("/api/safety/fatigue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alert: true, busId, driverId, ear: data.ear, coordinates }),
          }).catch(() => {});
        }
      }
    } catch (err) {
      setAnalysisStatus("service-down");
    }
  }, [busId, captureFrame, coordinates, driverId, tripActive]);

  const handleAuthorize = () => {
     if (audioRef.current) {
        audioRef.current.volume = 1.0;
        // Play then immediately pause to "unblock" audio for the browser session
        audioRef.current.play().then(() => {
           audioRef.current.pause();
           audioRef.current.currentTime = 0;
        }).catch(e => console.log("Audio unlock failed", e));
     }
     startCamera();
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    if (cameraReady && tripActive) {
      const timeout = setTimeout(() => {
        analyzeFrame();
        intervalRef.current = setInterval(analyzeFrame, ANALYZE_INTERVAL_MS);
      }, 2000);
      return () => {
        clearTimeout(timeout);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else if (!tripActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setFatigueState("ok");
      setAnalysisStatus("idle");
    }
  }, [cameraReady, tripActive, analyzeFrame]);


  return (
    <div className={cn(
      "relative bg-black border-2 rounded-[2.5rem] p-6 transition-all duration-500 overflow-hidden",
      fatigueState === "alert" ? "border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]" : 
      fatigueState === "warning" ? "border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.2)]" : 
      "border-[#39FF14]/20"
    )}>
      {/* HUD Header */}
      <div className="flex items-center justify-between mb-5 px-1">
         <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg bg-white/5",
              fatigueState === "alert" ? "text-red-500" : "text-[#39FF14]"
            )}>
              <Eye size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Biometric_Optics</span>
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Active_Face_Lock</span>
            </div>
         </div>
         <div className="flex items-center gap-3">
            {!tripActive && <Lock size={12} className="text-[#39FF14]/40" />}
            <div className={cn("px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest", 
               !tripActive ? "text-white/20 border-white/10" :
               fatigueState === "alert" ? "text-red-500 border-red-500 bg-red-500/10 animate-pulse" : 
               fatigueState === "warning" ? "text-amber-500 border-amber-500 bg-amber-500/10" : "text-[#39FF14] border-[#39FF14] bg-[#39FF14]/5"
            )}>
               {!tripActive ? "Standby" : fatigueState === "alert" ? "CRITICAL" : fatigueState === "warning" ? "WARNING" : "OPERATIONAL"}
            </div>
         </div>
      </div>

      <div className="relative rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 min-h-[400px] lg:min-h-[500px]">
         
         {!hasAuthorized && !cameraError && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 p-10 text-center">
              <Camera className="text-[#39FF14] mb-4 opacity-40 animate-pulse" size={64} />
              <h4 className="text-xl font-black text-white uppercase tracking-widest mb-4">Initialize Neural Link</h4>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-8 max-w-sm">Authority is required to stream biometric data to the central safety node.</p>
              <button 
                onClick={handleAuthorize}
                className="bg-[#39FF14] text-black px-12 py-5 rounded-2xl font-black uppercase tracking-tighter text-xs shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:scale-110 active:scale-95 transition-all flex items-center gap-3"
              >
                <ShieldCheck size={20} /> Authorize Optics
              </button>
           </div>
         )}

         {hasAuthorized && !cameraReady && !cameraError && (
           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
              <Activity className="text-[#39FF14] animate-spin mb-6" size={48} />
              <p className="text-xs font-black text-[#39FF14] uppercase tracking-[0.4em] animate-pulse">Syncing_Hardware_Nodes...</p>
           </div>
         )}
         
         {cameraError && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 p-10 text-center">
              <ShieldAlert className="text-red-500 mb-6" size={64} />
              <p className="text-lg font-black text-red-500 uppercase tracking-widest mb-2">Access_Blocked</p>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mb-10 max-w-xs leading-relaxed">
                {cameraError === "OS_PERMISSION_DENIED" 
                  ? "PERMISSION FAILURE: Site-wide security block detected. Manually reset the Site Settings (Lock icon) to grant access." 
                  : "HARDWARE FAILURE: No compatible optical array was detected at the terminal."}
              </p>
              <button 
                onClick={handleAuthorize}
                className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-2xl"
              >
                <RefreshCcw size={14} /> Attempt_Sync
              </button>
           </div>
         )}

         <video 
            ref={videoRef} autoPlay playsInline muted 
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-1000",
              !cameraReady ? "opacity-0" : !tripActive ? "grayscale opacity-30 scale-105" : "grayscale contrast-125 brightness-75 scale-110"
            )} 
            style={{ transform: "scaleX(-1)" }} 
         />
         <canvas ref={canvasRef} className="hidden" />

         {/* Grid Overlay */}
         <div className="absolute inset-0 pointer-events-none opacity-20" 
              style={{ backgroundImage: 'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

         {cameraReady && !tripActive && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm group-hover:bg-black/30 transition-all pointer-events-none">
              <div className="w-20 h-20 rounded-full border-2 border-[#39FF14]/20 flex items-center justify-center mb-4">
                 <Camera className="text-[#39FF14]/40" size={40} />
              </div>
              <p className="text-[10px] font-black text-[#39FF14]/40 uppercase tracking-[0.5em]">System_Idle</p>
           </div>
         )}

         {alarmActive && (
           <div className="absolute inset-0 flex items-center justify-center bg-red-600/60 backdrop-blur-md animate-pulse z-20">
              <div className="text-center">
                 <ShieldAlert className="text-white mx-auto mb-6" size={80} />
                 <h2 className="text-4xl font-black text-white tracking-tighter mb-8 bg-red-800/80 px-8 py-2">WAKE_UP_DETECTION</h2>
                 <button 
                   onClick={stopAlarm}
                   className="bg-white text-red-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all"
                 >
                   Clear Alert / Manual Reset
                 </button>
              </div>
           </div>
         )}

         {/* Target HUDs */}
         {tripActive && (
           <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-[#39FF14]/20 rounded-full animate-[ping_3s_infinite]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-[#39FF14] rounded-full" />
              
              <div className="absolute top-10 left-10">
                 {analysisStatus === "no-face" ? (
                   <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl border-2 border-white/50 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse flex items-center gap-3">
                       <ShieldAlert size={16} /> NO_FACE_DETECTED
                   </div>
                 ) : analysisStatus === "idle" && latestEar && (
                   <div className="bg-[#39FF14] text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(57,255,20,0.5)] flex items-center gap-3">
                       <Zap size={14} fill="currentColor" /> Biometric_Lock / EAR: {latestEar.toFixed(3)}
                   </div>
                 )}
              </div>
           </div>
         )}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6 px-4 border-t border-white/5 pt-8">
         {/* Metric 01: Link Quality */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <Zap size={12} className={cn(tripActive ? "text-[#39FF14]" : "text-white/10")} />
               <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Link_Quality</span>
            </div>
            <span className={cn("text-sm font-black font-mono", tripActive ? "text-[#39FF14]" : "text-white/20")}>
               {tripActive ? "STABLE" : "STANDBY"}
            </span>
         </div>

         {/* Metric 02: Neural Load */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <Activity size={12} className={cn(analysisStatus === "running" ? "text-[#39FF14]" : "text-white/10")} />
               <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Neural_Load</span>
            </div>
            <span className={cn("text-sm font-black font-mono transition-colors duration-300", 
               analysisStatus === "running" ? "text-[#39FF14]" : "text-white/20"
            )}>
               {analysisStatus === "running" ? "UPLINKING" : "ACTIVE"}
            </span>
         </div>

         {/* Metric 03: EAR Index */}
         <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <Eye size={12} className={cn(tripActive ? "text-[#39FF14]" : "text-white/10")} />
               <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">EAR_Index</span>
            </div>
            <div className="flex items-center gap-3">
               <span className={cn("text-sm font-black font-mono", tripActive ? "text-white" : "text-white/20")}>
                  {tripActive && latestEar ? latestEar.toFixed(2) : "0.00"}
               </span>
               <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#39FF14]/40 to-[#39FF14] transition-all duration-500 shadow-[0_0_8px_#39FF14]" 
                    style={{ width: latestEar && tripActive ? `${Math.min(100, latestEar * 300)}%` : '0%' }} 
                  />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
