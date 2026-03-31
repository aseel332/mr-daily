"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw, Calendar as CalendarIcon, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface CalendarHeaderProps {
  viewDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onReload: () => void;
  loading: boolean;
  view: "month" | "week" | "day";
  onViewChange: (v: "month" | "week" | "day") => void;
}

export function CalendarHeader({
  viewDate,
  onPrev,
  onNext,
  onToday,
  onReload,
  loading,
  view,
  onViewChange,
}: CalendarHeaderProps) {
  const monthYear = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-border bg-background gap-4">
      {/* Left: Navigation */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground min-w-[160px]">
          {monthYear}
        </h2>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-border">
          <Button variant="ghost" size="icon" onClick={onPrev} className="h-7 w-7 hover:bg-background text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToday} className="h-7 px-3 text-xs font-semibold hover:bg-background text-muted-foreground hover:text-foreground">
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext} className="h-7 w-7 hover:bg-background text-muted-foreground hover:text-foreground">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Right: Actions & View Switcher */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <Button
          variant="outline"
          size="icon"
          onClick={onReload}
          disabled={loading}
          className="h-9 w-9 border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-all"
        >
          <RotateCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>

        {/* Segmented Control */}
        <div className="flex items-center bg-muted rounded-lg p-1 border border-border relative isolate">
          {(["month", "week", "day"] as const).map((v) => {
            const isActive = view === v;
            return (
              <button
                key={v}
                onClick={() => onViewChange(v)}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-medium transition-all z-10 rounded-md",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="view-bg"
                    className="absolute inset-0 bg-primary rounded-md -z-10 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="capitalize">{v}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
