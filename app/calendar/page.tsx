// app/calendar/page.tsx
"use client";
import React, { useMemo, useState } from "react";
import { useSchedule } from "@/lib/hooks/useSchedule";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
//import { addMonths } from "@/components/CalendarMini"; // copy small helpers or reimplement here
import type { CalendarEvent } from "@/types/calendarTypes";
import { capitalizeFirst } from "@/lib/utils/capitalize";

function startOfWeek(d: Date) {
  const copy = new Date(d);
  const diff = copy.getDate() - copy.getDay();
  return new Date(copy.setDate(diff));
}

function getWeekDates(start: Date) {
  const arr: Date[] = [];
  for (let i = 0; i < 7; i++) arr.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  return arr;
}

export default function CalendarFull() {
  const { schedule, loading, reload } = useSchedule();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [focus, setFocus] = useState<Date | null>(null);
  const router = useRouter();

  // month grid
  const monthGrid = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const firstWeekday = first.getDay();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [month]);

  // map events by day
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of schedule) {
      const dt = ev.startTime || ev.deadline || null;
      if (!dt) continue;
      const key = new Date(dt).toISOString().slice(0,10);
      const arr = map.get(key) || [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [schedule]);

  const weekStart = useMemo(() => startOfWeek(focus || new Date()), [focus]);
  const weekDates = getWeekDates(weekStart);

  // render timeline for week/day
  function renderTimelineForDay(day: Date) {
    const key = day.toISOString().slice(0,10);
    const items = (eventsByDay.get(key) || []).slice().filter(i=>!!i.startTime).sort((a,b)=> (new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime()));
    // show hours 8am-8pm
    const hours = Array.from({length: 12}, (_,i)=>8+i);
    return (
      <div className="grid grid-cols-12 gap-2">
        <div className="col-span-2 text-xs text-slate-500">
          {hours.map(h => <div key={h} className="h-16">{h}:00</div>)}
        </div>
        <div className="col-span-10 space-y-2">
          {hours.map(h => (
            <div key={h} className="h-16 border-b border-slate-100 relative">
              {/* events that start in this hour (position) */}
              {items.filter(it => {
                const st = new Date(it.startTime!);
                return st.getHours()===h;
              }).map(it => {
                const st = new Date(it.startTime!);
                const et = it.endTime ? new Date(it.endTime) : new Date(st.getTime() + (it.durationMinutes||30)*60000);
                const topOffset = (st.getMinutes()/60)*64; // 64px hour height
                const height = Math.max(28, ((et.getTime()-st.getTime())/60000/60)*64);
                return (
                  <div key={it.id} className="absolute left-0 right-0 ml-2 rounded-md p-2 bg-indigo-600 text-white text-xs" style={{ top: topOffset, height }}>
                    <div className="font-semibold">{it.title}</div>
                    <div className="text-[11px]">{new Date(it.startTime!).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"})} - {it.endTime ? new Date(it.endTime).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}) : ""}</div>
                    {it.priority && <div className="text-[11px] mt-1">{capitalizeFirst(it.priority)}</div>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="text-sm text-slate-500">Month view / Week timeline</div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))}>◀</Button>
          <div className="px-3">{month.toLocaleDateString([], { month: "long", year: "numeric" })}</div>
          <Button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))}>▶</Button>

          <Button onClick={() => setView("month")}>Month</Button>
          <Button onClick={() => setView("week")}>Week</Button>
          <Button onClick={() => setView("day")}>Day</Button>
          <Button onClick={() => reload()}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* month grid */}
        <div className="md:col-span-1 bg-white p-4 rounded-2xl shadow-sm">
          <div className="grid grid-cols-7 text-xs text-center text-slate-400 mb-2">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(w => <div key={w}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((cell, i) => {
              const key = cell ? cell.toISOString().slice(0,10) : null;
              const items = key ? (eventsByDay.get(key) || []) : [];
              return (
                <div key={i} onClick={() => { if (cell) { setFocus(cell); setView("day"); } }} className={`h-20 p-1 rounded-md ${cell ? "hover:bg-slate-50 cursor-pointer" : "opacity-30"}`}>
                  <div className="flex justify-between items-start">
                    <div className="text-sm">{cell ? cell.getDate() : ""}</div>
                    {items.length > 0 && <div className="text-xs text-indigo-600 font-medium">{items.length}</div>}
                  </div>
                  <div className="mt-1 space-y-1">
                    {items.slice(0,3).map(it => <div key={it.id} className="text-[11px] truncate">{it.title}</div>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* timeline / detail */}
        <div className="md:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
          {view === "month" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Month Overview</h3>
              <p className="text-sm text-slate-500 mb-4">Click a day on the left to view that day in detail below.</p>
            </div>
          )}

          {view === "week" && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Week Timeline</h3>
              <div className="flex gap-4">
                {weekDates.map(d => (
                  <div key={d.toISOString()} className="flex-1">
                    <div className="text-sm font-medium mb-2">{d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</div>
                    <div className="space-y-2">
                      {(eventsByDay.get(d.toISOString().slice(0,10)) || []).map(ev => (
                        <div key={ev.id} className="p-2 bg-indigo-50 rounded">
                          <div className="font-medium">{ev.title}</div>
                          <div className="text-xs text-slate-500">{ev.startTime ? new Date(ev.startTime).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}) : "No time"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "day" && focus && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Day: {focus.toLocaleDateString()}</h3>
              {renderTimelineForDay(focus)}
            </div>
          )}

          {(!view || view === "month") && focus && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3">Day detail: {focus.toLocaleDateString()}</h3>
              {(eventsByDay.get(focus.toISOString().slice(0,10)) || []).map(it => (
                <div key={it.id} className="p-3 mb-2 bg-slate-50 rounded">{it.title} • {it.startTime ? new Date(it.startTime).toLocaleTimeString([], {hour:"numeric", minute:"2-digit"}) : "No time"}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
