"use client";

import React from "react";
import { Calendar, CheckSquare, Clock } from "lucide-react";
import type { CalendarEvent } from "@/types/calendarTypes";

interface QuickStatsProps {
  todayCount: number;
  pendingTodos: number;
  nextEvent: CalendarEvent | null;
}

export function QuickStats({ todayCount, pendingTodos, nextEvent }: QuickStatsProps) {
  const nextTime = nextEvent?.startTime
    ? new Date(nextEvent.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div className="grid grid-cols-3 gap-3">
      <StatPill
        icon={<Calendar size={14} />}
        label="Today"
        value={todayCount}
        accent="cyan"
      />
      <StatPill
        icon={<CheckSquare size={14} />}
        label="Pending"
        value={pendingTodos}
        accent="violet"
      />
      <StatPill
        icon={<Clock size={14} />}
        label="Next"
        value={nextTime || "—"}
        accent="amber"
      />
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: "cyan" | "violet" | "amber";
}) {
  const accentColors = {
    cyan: "border-neon-cyan/20 text-neon-cyan",
    violet: "border-neon-violet/20 text-neon-violet",
    amber: "border-neon-amber/20 text-neon-amber",
  };

  return (
    <div className="neon-container flex flex-col items-center justify-center p-3 gap-1.5 text-center">
      <div className={accentColors[accent]}>{icon}</div>
      <div className="text-lg font-bold text-zinc-200">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</div>
    </div>
  );
}
