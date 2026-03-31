"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";

const events = [
  { id: 1, title: "Breakfast Meeting", time: "08:00 - 09:00", color: "bg-neon-amber/20 border-neon-amber/40 text-neon-amber", row: 1, col: 1 },
  { id: 2, title: "Focus Work", time: "09:30 - 11:30", color: "bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan", row: 2, col: 1 },
  { id: 3, title: "AI Sync", time: "12:00 - 13:00", color: "bg-neon-violet/20 border-neon-violet/40 text-neon-violet", row: 4, col: 1 },
  { id: 4, title: "Gym Session", time: "16:00 - 17:00", color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400", row: 6, col: 1 },
];

const optimizationSteps = [
  { text: "Analyzing your energy levels...", icon: <Clock className="w-4 h-4" /> },
  { text: "Scanning for schedule conflicts...", icon: <CalendarIcon className="w-4 h-4" /> },
  { text: "Optimizing focus blocks...", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
];

export function CalendarPlanningAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [isOptimizing, setIsOptimizing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % optimizationSteps.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl border border-white/10 overflow-hidden shadow-2xl bg-[#0d0d14]">
      {/* Calendar Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <h4 className="font-semibold text-zinc-100">February 2026</h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-1 rounded-md bg-neon-cyan/10 text-neon-cyan text-xs font-medium border border-neon-cyan/20">
            Day
          </div>
          <div className="px-2 py-1 rounded-md hover:bg-white/5 text-zinc-500 text-xs font-medium">
            Week
          </div>
          <div className="px-2 py-1 rounded-md hover:bg-white/5 text-zinc-500 text-xs font-medium">
            Month
          </div>
        </div>
      </div>

      <div className="flex h-[400px]">
        {/* Time Sidebar */}
        <div className="w-16 border-r border-white/10 py-4 flex flex-col justify-between text-[10px] text-zinc-500 font-medium px-2">
          <span>08:00</span>
          <span>10:00</span>
          <span>12:00</span>
          <span>14:00</span>
          <span>16:00</span>
          <span>18:00</span>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative p-4 bg-[length:20px_20px] bg-grid-white/[0.03]">
          <AnimatePresence>
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  y: isOptimizing ? [0, -5, 0] : 0
                }}
                transition={{
                  delay: i * 0.2,
                  duration: 0.5,
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                className={`absolute w-[80%] p-3 rounded-xl shadow-lg border backdrop-blur-sm ${event.color}`}
                style={{
                  top: `${(event.row - 1) * 60 + 16}px`,
                  left: "10%",
                }}
              >
                <div className="font-bold text-xs truncate">{event.title}</div>
                <div className="text-[10px] opacity-80">{event.time}</div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Alfred Optimization Overlay */}
          <div className="absolute bottom-6 right-6 left-6 p-4 rounded-2xl bg-[#0d0d14]/90 backdrop-blur-md border border-white/10 shadow-lg z-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center text-black">
                <SparkleIcon className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-zinc-100">Alfred is planning...</div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  {optimizationSteps[activeStep].icon}
                  {optimizationSteps[activeStep].text}
                </div>
              </div>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-1/2 h-full bg-neon-cyan"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
