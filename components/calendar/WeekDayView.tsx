"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendarTypes";
import { formatHour } from "@/lib/utils/calendar";

interface WeekDayViewProps {
  dates: Date[];
  eventsByDay: Map<string, CalendarEvent[]>;
}

const HOUR_HEIGHT = 56; // Increased from 48 for better spacing
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT;

export function WeekDayView({ dates, eventsByDay }: WeekDayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayStr = new Date().toDateString();

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const scrollPos = Math.max(0, (minutes / 60) * HOUR_HEIGHT - 200);
      scrollRef.current.scrollTop = scrollPos;
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Sticky day headers */}
      <div className="flex border-b border-border shrink-0 bg-background z-20 shadow-sm">
        <div className="w-14 shrink-0 border-r border-border bg-background" /> {/* Time column width match */}
        {dates.map((d) => {
          const isToday = d.toDateString() === todayStr;
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "flex-1 min-w-[120px] text-center py-3 border-r border-border last:border-r-0",
                isToday ? "bg-primary/5" : "bg-transparent"
              )}
            >
              <div className={cn(
                "text-[11px] uppercase tracking-wider font-semibold mb-1",
                isToday ? "text-primary" : "text-muted-foreground"
              )}>
                {d.toLocaleDateString([], { weekday: "short" })}
              </div>
              <div className={cn(
                "text-xl font-bold w-10 h-10 rounded-full flex items-center justify-center mx-auto transition-all",
                isToday
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-foreground"
              )}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scrollable timeline */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar bg-background" ref={scrollRef}>
        <div className="flex relative" style={{ minHeight: TOTAL_HEIGHT }}>

          {/* Time sidebar */}
          <div className="w-14 shrink-0 border-r border-border text-[10px] text-muted-foreground font-medium relative z-10 bg-background">
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="relative border-b border-transparent" style={{ height: HOUR_HEIGHT }}>
                {h > 0 && (
                  <span className="absolute -top-2 right-3 translate-y-1/2">
                    {formatHour(h)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid Content */}
          <div className="flex-1 flex relative bg-[url('/grid-pattern.svg')]">
            {/* Horizontal Hour Lines */}
            <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="border-b border-border/40 w-full" style={{ height: HOUR_HEIGHT }} />
              ))}
            </div>

            {/* Vertical Day Lines */}
            <div className="absolute inset-0 flex pointer-events-none z-0">
              {dates.map((_, i) => (
                <div key={i} className="flex-1 min-w-[120px] border-r border-border h-full first:border-l-0" />
              ))}
            </div>

            {/* Events Overlay */}
            <div className="absolute inset-0 flex z-10">
              {dates.map((d) => {
                const key = d.toLocaleDateString("en-CA");
                const items = (eventsByDay.get(key) || [])
                  .filter((i) => !!i.startTime)
                  .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());
                const isToday = d.toDateString() === todayStr;

                return (
                  <div key={d.toISOString()} className="flex-1 relative group">
                    {/* Hover effect for column */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.01] transition-colors pointer-events-none" />

                    {/* Current time indicator */}
                    {isToday && <CurrentTimeLine hourHeight={HOUR_HEIGHT} />}

                    {items.map((it) => {
                      const st = new Date(it.startTime!);
                      const et = it.endTime
                        ? new Date(it.endTime)
                        : new Date(st.getTime() + (it.durationMinutes || 60) * 60000);

                      const startMin = st.getHours() * 60 + st.getMinutes();
                      const endMin = et.getHours() * 60 + et.getMinutes();
                      const duration = Math.max(HOUR_HEIGHT / 2, ((endMin - startMin) / 60) * HOUR_HEIGHT);
                      const top = (startMin / 60) * HOUR_HEIGHT;

                      const colorClass = getColorClasses(it.color);

                      return (
                        <div
                          key={it.id}
                          className={cn(
                            "absolute left-1 right-1 rounded-lg px-2 py-1.5 text-xs border-l-[3px] overflow-hidden leading-tight transition-all hover:brightness-110 hover:shadow-lg hover:z-20 cursor-pointer astral-glass",
                            colorClass.bg,
                            colorClass.border,
                            colorClass.text
                          )}
                          style={{ top, height: duration }}
                        >
                          <div className="font-semibold truncate">{it.title}</div>
                          <div className="opacity-70 truncate text-[10px] mt-0.5 font-medium">
                            {st.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                            {" - "}
                            {et.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Current time indicator line */
function CurrentTimeLine({ hourHeight }: { hourHeight: number }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const minutes = now.getHours() * 60 + now.getMinutes();
  const top = (minutes / 60) * hourHeight;

  return (
    <div
      className="absolute z-30 w-full pointer-events-none flex items-center -translate-y-1/2"
      style={{ top }}
    >
      <div className="w-2.5 h-2.5 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(0,240,255,1)] -ml-1.5 border border-background relative z-10" />
      <div className="h-[2px] bg-neon-cyan/70 w-full shadow-[0_0_4px_rgba(0,240,255,0.5)]" />
    </div>
  );
}

function getColorClasses(color?: string | null) {
  switch (color) {
    case "cyan": return { bg: "bg-neon-cyan/10", border: "border-neon-cyan", text: "text-neon-cyan" };
    case "violet": return { bg: "bg-neon-violet/10", border: "border-neon-violet", text: "text-neon-violet" };
    case "rose": return { bg: "bg-neon-rose/10", border: "border-neon-rose", text: "text-neon-rose" };
    case "amber": return { bg: "bg-neon-amber/10", border: "border-neon-amber", text: "text-neon-amber" };
    case "emerald":
    case "green": return { bg: "bg-neon-emerald/10", border: "border-neon-emerald", text: "text-neon-emerald" };
    case "blue": return { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-400" };
    case "red": return { bg: "bg-red-500/10", border: "border-red-500", text: "text-red-400" };
    case "orange": return { bg: "bg-orange-500/10", border: "border-orange-500", text: "text-orange-400" };
    default: return { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-400" };
  }
}
