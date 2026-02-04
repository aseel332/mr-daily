// components/EventCard.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { capitalizeFirst } from "@/lib/utils/capitalize";
import type { CalendarEvent } from "@/types/calendarTypes";

type Props = {
  it: CalendarEvent;
  onComplete?: (i: CalendarEvent) => void;
  onDelete?: (i: CalendarEvent) => void;
};

export default function EventCard({ it, onComplete, onDelete }: Props) {
  const when = it.startTime
    ? new Date(it.startTime).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : it.deadline
      ? `Due ${new Date(it.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
      : "No time specified";

  return (
    <article className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex-1">
        <div className="text-lg font-semibold">{it.title}</div>
        <div className="text-xs text-slate-500 mt-1">{when}</div>
        {it.location && <div className="text-xs text-slate-500 mt-1">📍 {it.location}</div>}
        {it.notes && <div className="text-xs text-slate-400 mt-1">{it.notes}</div>}
        {it.priority && <div className="inline-block mt-2 text-xs px-2 py-1 rounded bg-slate-100">{capitalizeFirst(it.priority)}</div>}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => onComplete?.(it)} className="flex items-center gap-2"><Check size={14} />{it.type === "todo" ? "Done" : "Complete"}</Button>
        <Button variant="ghost" onClick={() => onDelete?.(it)} className="text-red-600"><Trash2 size={14} /></Button>
      </div>
    </article>
  );
}
