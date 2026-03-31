// app/calendar/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useSchedule } from "@/lib/hooks/useSchedule";
import type { CalendarEvent } from "@/types/calendarTypes";
import { startOfWeek, getWeekDates, getEventsByDay } from "@/lib/utils/calendar";

import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekDayView } from "@/components/calendar/WeekDayView";

export default function CalendarPage() {
  const { schedule, loading, reload } = useSchedule();
  const [viewDate, setViewDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("week");

  const weekStart = startOfWeek(viewDate);
  const weekDates = getWeekDates(weekStart);
  const eventsByDay = useMemo(() => getEventsByDay(schedule), [schedule]);

  const handlePrev = () => {
    const d = new Date(viewDate);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setViewDate(d);
  };

  const handleNext = () => {
    const d = new Date(viewDate);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setViewDate(d);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <CalendarHeader
        view={view}
        viewDate={viewDate}
        loading={loading}
        onPrev={handlePrev}
        onNext={() => handleNext()}
        onToday={() => setViewDate(new Date())}
        onViewChange={setView}
        onReload={reload}
      />

      <div className="flex-1 neon-container rounded-none border-x-0 border-b-0 overflow-hidden flex flex-col">
        {view === "month" && (
          <MonthView
            viewDate={viewDate}
            eventsByDay={eventsByDay}
            onDayClick={(d) => { setViewDate(d); setView("day"); }}
          />
        )}
        {(view === "week" || view === "day") && (
          <WeekDayView
            dates={view === "week" ? weekDates : [viewDate]}
            eventsByDay={eventsByDay}
          />
        )}
      </div>
    </div>
  );
}
