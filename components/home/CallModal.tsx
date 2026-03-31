"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneOff, Mic, MicOff, User, Bot, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CallStatus = "idle" | "creating" | "connecting" | "connected" | "ended";

interface CallModalProps {
  isOpen: boolean;
  status: CallStatus;
  onHangup: () => void;
  userName?: string;
  assistantName?: string;
}

export function CallModal({
  isOpen,
  status,
  onHangup,
  userName = "You",
  assistantName = "Alfred",
}: CallModalProps) {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "connected") {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isActive = status === "connected";
  const isConnecting = status === "creating" || status === "connecting";

  if (!isOpen && status === "idle") return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 text-center border-b border-white/5">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isActive ? "bg-neon-cyan" : "bg-zinc-600"
                )} />
                <span className="text-sm font-medium text-zinc-400 tracking-wider uppercase">
                  {status === "creating" && "Initializing Alfred..."}
                  {status === "connecting" && "Connecting to Alfred..."}
                  {status === "connected" && "Call in Progress"}
                  {status === "ended" && "Call Ended"}
                </span>
              </div>
              {isActive && (
                <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-xs">
                  <Clock size={12} />
                  <span>{formatDuration(duration)}</span>
                </div>
              )}
            </div>

            {/* Content / Visualization */}
            <div className="relative h-64 flex items-center justify-center bg-gradient-to-b from-transparent to-black/20">
              {/* Outer Glows */}
              <AnimatePresence>
                {(isActive || isConnecting) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <div className={cn(
                      "w-48 h-48 rounded-full blur-[60px] opacity-20 transition-colors duration-1000",
                      isActive ? "bg-neon-cyan" : "bg-neon-violet"
                    )} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Visualization */}
              <div className="flex items-center justify-center gap-10 z-10 w-full px-10">
                {/* User Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400">
                    <User size={32} />
                  </div>
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tighter">{userName}</span>
                </div>

                {/* Center Orb (Voice Visualizer) */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {(isActive || isConnecting) && (
                    <>
                      <motion.div
                        animate={{ scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={cn(
                          "absolute inset-0 rounded-full border-2",
                          isActive ? "border-neon-cyan/30" : "border-neon-violet/30"
                        )}
                      />
                      <motion.div
                        animate={{ scale: isActive ? [1, 1.4, 1] : [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className={cn(
                          "absolute inset-0 rounded-full border",
                          isActive ? "border-neon-cyan/15" : "border-neon-violet/15"
                        )}
                      />
                    </>
                  )}

                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg z-20",
                    isActive
                      ? "bg-neon-cyan text-black shadow-neon-cyan/40 scale-110"
                      : isConnecting
                        ? "bg-neon-violet text-white shadow-neon-violet/40 animate-pulse"
                        : "bg-zinc-800 text-zinc-500"
                  )}>
                    {isActive ? (
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-black rounded-full"
                            animate={{ height: [6, 16, 6] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                    ) : (
                      <Bot size={28} />
                    )}
                  </div>
                </div>

                {/* Alfred Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-500 border overflow-hidden",
                    isActive
                      ? "bg-neon-cyan/10 border-neon-cyan/30"
                      : "bg-white/5 border-white/10 text-zinc-400"
                  )}>
                    {isActive ? (
                      <div className="w-full h-full flex items-center justify-center bg-neon-cyan text-black font-bold text-xl">A</div>
                    ) : (
                      <Bot size={32} />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold uppercase tracking-tighter",
                    isActive ? "text-neon-cyan" : "text-zinc-500"
                  )}>{assistantName}</span>
                </div>
              </div>
            </div>

            {/* Footer / Controls */}
            <div className="p-8 pb-10 flex justify-center items-center gap-6 bg-black/40">
              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-not-allowed opacity-50"
              >
                <Mic size={24} />
              </Button>

              <Button
                onClick={onHangup}
                variant="destructive"
                size="icon"
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-900/20 transition-all hover:scale-110 active:scale-95 group"
              >
                <PhoneOff size={28} className="group-hover:rotate-12 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="w-14 h-14 rounded-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-not-allowed opacity-50"
              >
                <User size={24} />
              </Button>
            </div>

            <div className="pb-4 text-center">
              <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-[0.2em]">End-to-End Encrypted Call</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
