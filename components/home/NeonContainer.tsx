"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NeonContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  icon?: LucideIcon;
  title?: string;
  badge?: string | number;
  accent?: "cyan" | "violet" | "rose" | "amber" | "emerald";
  className?: string;
}

export function NeonContainer({
  children,
  icon: Icon,
  title,
  badge,
  accent = "cyan",
  className,
  ...props
}: NeonContainerProps) {
  return (
    <div
      className={cn(
        "neon-container flex flex-col p-6 gap-4 bg-[#0d0d14]/40 border-white/10 shadow-lg", // Base
        accent === "violet" && "hover:border-neon-violet/30 hover:shadow-neon-violet/5",
        accent === "rose" && "hover:border-neon-rose/30 hover:shadow-neon-rose/5",
        accent === "cyan" && "hover:border-neon-cyan/30 hover:shadow-neon-cyan/5",
        accent === "amber" && "hover:border-neon-amber/30 hover:shadow-neon-amber/5",
        className
      )}
      {...props}
    >
      {(title || Icon) && (
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-white/5",
                accent === "cyan" && "text-neon-cyan",
                accent === "violet" && "text-neon-violet",
                accent === "rose" && "text-neon-rose",
                accent === "amber" && "text-neon-amber",
                accent === "emerald" && "text-neon-emerald"
              )}>
                <Icon size={16} />
              </div>
            )}
            {title && (
              <h3 className="font-semibold text-zinc-100 tracking-tight">
                {title}
              </h3>
            )}
          </div>
          {badge !== undefined && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/5 border-white/10",
              accent === "cyan" && "text-neon-cyan border-neon-cyan/20",
              accent === "violet" && "text-neon-violet border-neon-violet/20",
              accent === "rose" && "text-neon-rose border-neon-rose/20"
            )}>
              {badge}
            </span>
          )}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
