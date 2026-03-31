"use client";

import React from "react";
import { motion } from "framer-motion";
import { Phone, PhoneOff } from "lucide-react";
import { cn } from "@/lib/utils";

type CallStatus = "idle" | "creating" | "connecting" | "connected" | "ended";

interface AlfredVoiceOrbProps {
  callStatus: CallStatus;
  onStartCall: () => void;
  onHangup: () => void;
}

export function AlfredVoiceOrb({ callStatus, onStartCall, onHangup }: AlfredVoiceOrbProps) {
  const isActive = callStatus === "connected";
  const isConnecting = callStatus === "creating" || callStatus === "connecting";
  const isIdle = callStatus === "idle" || callStatus === "ended";

  const handleClick = () => {
    if (isIdle) onStartCall();
    else if (isActive || isConnecting) onHangup();
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Outer pulse rings */}
      {(isActive || isConnecting) && (
        <>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={cn(
                "w-36 h-36 rounded-full border animate-orb-pulse",
                isActive
                  ? "border-neon-cyan/20"
                  : "border-neon-violet/20"
              )}
              style={{ animationDelay: "0s" }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              className={cn(
                "w-48 h-48 rounded-full border animate-orb-pulse",
                isActive
                  ? "border-neon-cyan/10"
                  : "border-neon-violet/10"
              )}
              style={{ animationDelay: "0.5s" }}
            />
          </div>
        </>
      )}

      {/* Main orb */}
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 z-10",
          isActive && "bg-neon-cyan/10 border-2 border-neon-cyan shadow-[0_0_40px_rgba(0,240,255,0.3)]",
          isConnecting && "bg-neon-violet/10 border-2 border-neon-violet shadow-[0_0_30px_rgba(168,85,247,0.25)]",
          isIdle && "bg-white/5 border border-white/10 hover:border-neon-cyan/40 hover:shadow-[0_0_25px_rgba(0,240,255,0.15)]"
        )}
      >
        {/* Voice bars (active/connecting state) */}
        {(isActive || isConnecting) ? (
          <div className="flex items-center gap-[3px] h-10">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "w-[4px] rounded-full",
                  isActive ? "bg-neon-cyan" : "bg-neon-violet"
                )}
                animate={{
                  height: isActive
                    ? [8, 28, 12, 32, 8]
                    : [6, 14, 6, 14, 6],
                }}
                transition={{
                  duration: isActive ? 0.8 : 1.2,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        ) : (
          <Phone size={28} className="text-zinc-400" />
        )}
      </motion.button>

      {/* Label */}
      <div className="text-center z-10">
        <p className={cn(
          "text-sm font-medium",
          isActive ? "text-neon-cyan neon-text" : isConnecting ? "text-neon-violet neon-text-violet" : "text-zinc-400"
        )}>
          {isIdle && "Talk to Alfred"}
          {callStatus === "creating" && "Starting..."}
          {callStatus === "connecting" && "Connecting..."}
          {isActive && "Alfred is listening"}
        </p>
        {isActive && (
          <button
            onClick={onHangup}
            className="mt-2 flex items-center gap-1.5 mx-auto text-xs text-zinc-500 hover:text-neon-rose transition-colors"
          >
            <PhoneOff size={12} />
            End Call
          </button>
        )}
      </div>
    </div>
  );
}
