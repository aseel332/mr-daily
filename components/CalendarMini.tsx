// components/CalendarMini.tsx
"use client";
import React, { useMemo } from "react";
import { useRouter } from "next/navigation";

type Props = {
  eventsByDay: Map<string, any[]>;
  calendarMonth: Date;
  setCalendarMonth: (d: Date) => void;
  onSelectDay?: (d: Date | null) => void;
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export default function CalendarMini({ eventsByDay, calendarMonth, setCalendarMonth, onSelectDay }: Props) {
  const router = useRouter();

  const grid = useMemo(() => {
    const first = startOfMonth(calendarMonth);
    const last = endOfMonth(calendarMonth);
    const firstWeekday = first.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstWeekday; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [calendarMonth]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Calendar</div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))} className="px-2 py-1 rounded hover:bg-slate-100">◀</button>
          <div>{calendarMonth.toLocaleDateString([], { month: "long", year: "numeric" })}</div>
          <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} className="px-2 py-1 rounded hover:bg-slate-100">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-xs text-center text-slate-400 mb-2">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(w => <div key={w}>{w}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {grid.map((cell, i) => {
          const key = cell ? cell.toISOString().slice(0,10) : null;
          const has = key ? eventsByDay.has(key) : false;
          return (
            <button
              key={i}
              onClick={() => onSelectDay ? onSelectDay(cell) : router.push("/calendar")}
              className={`h-10 flex items-center justify-center rounded-md text-sm ${cell ? "hover:bg-slate-100" : "opacity-30"}`}
            >
              <div className="flex flex-col items-center">
                <div className={`${cell && (new Date().toISOString().slice(0,10) === key) ? "font-semibold" : ""}`}>{cell ? cell.getDate() : ""}</div>
                {has && <div className="h-1 w-1 rounded-full bg-indigo-600 mt-1" />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-xs text-slate-500 mt-3">Tap a day to filter — click calendar to open full view.</div>
    </div>
  );
}
