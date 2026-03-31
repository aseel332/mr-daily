"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mic, PhoneOff, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

const transcript = [
  { side: "ai", text: "Hello! This is Alfred, calling on behalf of Alex." },
  { side: "user", text: "Oh, hi Alfred. How can I help?" },
  { side: "ai", text: "Alex would like to book a table for two this Friday at 7 PM." },
  { side: "user", text: "Let me check... yes, we have a spot available." },
  { side: "ai", text: "Perfect! Please confirm the booking for Alex Smith." },
  { side: "user", text: "Confirmed. See you Friday!" },
];

export function CallFeatureAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % (transcript.length + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[9/16] bg-[#0d0d14] rounded-[48px] border-[8px] border-[#1a1a24] overflow-hidden shadow-2xl shadow-neon-cyan/5">
      {/* Phone Screen UI */}
      <div className="absolute inset-0 bg-[#0d0d14] flex flex-col pt-12">
        {/* Status Bar */}
        <div className="px-8 flex justify-between items-center opacity-60">
          <span className="text-xs text-white">9:41</span>
          <div className="flex gap-1.5 items-center">
            <div className="w-4 h-2 rounded-[2px] border border-white/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Header */}
        <div className="mt-8 text-center px-6">
          <div className="w-20 h-20 bg-neon-cyan/20 rounded-full mx-auto flex items-center justify-center border border-neon-cyan/30 relative">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 bg-neon-cyan/10 rounded-full"
            />
            <Phone className="w-8 h-8 text-neon-cyan relative z-10" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-white">Alfred is Calling</h3>
          <p className="text-sm text-neon-cyan/80 mb-6">Booking: Restaurant reservation</p>

          {/* Waveform */}
          <div className="flex items-center justify-center gap-1 h-8">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  height: [8, 24, 8],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                className="w-1 bg-neon-cyan rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Transcript Area */}
        <div className="flex-1 mt-8 px-6 space-y-4 overflow-hidden pointer-events-none">
          <AnimatePresence mode="popLayout">
            {transcript.slice(0, step).map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex ${item.side === "ai" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${item.side === "ai"
                    ? "bg-neon-cyan text-black font-medium rounded-tl-none"
                    : "bg-[#1a1a24] text-zinc-300 rounded-tr-none border border-white/10"
                    }`}
                >
                  {item.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Call Controls */}
        <div className="h-40 bg-gradient-to-t from-black/80 to-transparent flex flex-wrap justify-center items-center gap-6 px-10 pb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#1a1a24] flex items-center justify-center">
              <Mic className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-[10px] text-white/40 uppercase">Mute</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-neon-rose flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <PhoneOff className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] text-white/40 uppercase">End</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-[#1a1a24] flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-[10px] text-white/40 uppercase">Transcript</span>
          </div>
        </div>
      </div>

      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1a24] rounded-b-[18px]" />
    </div>
  );
}
