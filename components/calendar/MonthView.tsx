"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendarTypes";
import { getMonthGrid } from "@/lib/utils/calendar";

interface MonthViewProps {
  viewDate: Date;
  eventsByDay: Map<string, CalendarEvent[]>;
  onDayClick: (date: Date) => void;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({ viewDate, eventsByDay, onDayClick }: MonthViewProps) {
  const monthGrid = useMemo(() => getMonthGrid(viewDate), [viewDate]);
  const todayStr = new Date().toDateString();

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border shrink-0 bg-background">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-3 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-hidden">
        {monthGrid.map((day, i) => {
          const key = day ? day.toLocaleDateString("en-CA") : "";
          const items = day ? (eventsByDay.get(key) || []) : [];
          const isToday = day ? day.toDateString() === todayStr : false;

          return (
            <div
              key={i}
              className={cn(
                "border-b border-r border-border p-2 flex flex-col overflow-hidden relative transition-all duration-200 min-h-0",
                day ? "hover:bg-accent/30 cursor-pointer group" : "bg-accent/5",
                i % 7 === 0 && "border-l-0" // Remove left border for first col if desired, but grid usually wants all internal borders
              )}
              onClick={() => day && onDayClick(day)}
            >
              {day && (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <div className={cn(
                      "text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-all",
                      isToday
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar min-h-0">
                    {items.slice(0, 4).map((ev) => {
                      const colorClass = getColorClasses((ev as any).color);
                      return (
                        <div
                          key={ev.id}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded truncate border-l-[2px] transition-all hover:brightness-110",
                            colorClass.bg,
                            colorClass.text,
                            colorClass.border
                          )}
                        >
                          <span className="font-medium opacity-100">{ev.title}</span>
                          {ev.startTime && <span className="opacity-70 ml-1 font-normal hidden xl:inline">
                            {new Date(ev.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </span>}
                        </div>
                      );
                    })}
                    {items.length > 4 && (
                      <div className="text-[10px] text-zinc-500 pl-1 font-medium hover:text-zinc-300">
                        +{items.length - 4} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getColorClasses(color?: string | null) {
  switch (color) {
    case "cyan": return { bg: "bg-neon-cyan/5", border: "border-neon-cyan", text: "text-neon-cyan" };
    case "violet": return { bg: "bg-neon-violet/5", border: "border-neon-violet", text: "text-neon-violet" };
    case "rose": return { bg: "bg-neon-rose/5", border: "border-neon-rose", text: "text-neon-rose" };
    case "amber": return { bg: "bg-neon-amber/5", border: "border-neon-amber", text: "text-neon-amber" };
    case "emerald":
    case "green": return { bg: "bg-neon-emerald/5", border: "border-neon-emerald", text: "text-neon-emerald" };
    case "blue": return { bg: "bg-blue-500/5", border: "border-blue-500", text: "text-blue-400" };
    case "red": return { bg: "bg-red-500/5", border: "border-red-500", text: "text-red-400" };
    case "orange": return { bg: "bg-orange-500/5", border: "border-orange-500", text: "text-orange-400" };
    default: return { bg: "bg-white/5", border: "border-zinc-500", text: "text-zinc-400" };
  }
}
