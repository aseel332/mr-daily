"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, Trash2, GripVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendarTypes";

interface NotionBlockProps {
  item: CalendarEvent;
  onComplete?: (item: CalendarEvent) => void;
  onDelete?: (item: CalendarEvent) => void;
  onClick?: (item: CalendarEvent) => void;
}

const EVENT_COLORS: Record<string, string> = {
  blue: "bg-blue-500/20 border-blue-400/40",
  cyan: "bg-cyan-400/20 border-cyan-400/40",
  violet: "bg-violet-500/20 border-violet-400/40",
  green: "bg-emerald-500/20 border-emerald-400/40",
  amber: "bg-amber-500/20 border-amber-400/40",
  rose: "bg-rose-500/20 border-rose-400/40",
  red: "bg-red-500/20 border-red-400/40",
  orange: "bg-orange-500/20 border-orange-400/40",
};

export function NotionBlock({ item, onComplete, onDelete, onClick }: NotionBlockProps) {
  const isTodo = item.type === "todo";
  const isDone = isTodo && (item as any).isDone;
  const eventColor = (item as any).color as string | undefined;

  // Time formatting
  let timeString: string | null = null;
  if (!isTodo && item.startTime) {
    const st = new Date(item.startTime);
    const et = item.endTime ? new Date(item.endTime) : new Date(st.getTime() + (item.durationMinutes || 30) * 60000);
    timeString = `${st.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${et.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  } else if (isTodo && item.deadline) {
    timeString = "Due " + new Date(item.deadline).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-start gap-3 py-1.5 px-2 rounded-lg cursor-pointer transition-colors relative hover:bg-white/[0.03]"
    >
      {/* Drag handle */}
      <div className="opacity-0 group-hover:opacity-100 absolute left-[-20px] top-2 text-zinc-600 hover:text-zinc-400 cursor-grab">
        <GripVertical size={16} />
      </div>

      {/* Color dot / Checkbox */}
      <div
        className="mt-1 shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
        onClick={(e) => { e.stopPropagation(); onComplete?.(item); }}
      >
        {isTodo ? (
          <div className={cn(
            "w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all",
            isDone
              ? "bg-neon-cyan border-neon-cyan text-background"
              : "border-zinc-600 hover:border-neon-cyan/50 hover:shadow-[0_0_6px_rgba(0,240,255,0.2)]"
          )}>
            {isDone && <Check size={10} strokeWidth={3} />}
          </div>
        ) : (
          <div className="w-4 h-4 flex items-center justify-center">
            <div className={cn(
              "w-2 h-2 rounded-full transition-colors",
              eventColor ? `bg-${eventColor}-400` : "bg-zinc-500 group-hover:bg-zinc-400"
            )}
              style={eventColor ? { backgroundColor: `var(--event-${eventColor})` } : undefined}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={() => onClick?.(item)}>
        <div className={cn(
          "text-[15px] leading-relaxed text-zinc-200",
          isDone && "line-through text-zinc-600"
        )}>
          {item.title}

          {/* Time tag */}
          {timeString && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-zinc-500 font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
              {timeString}
            </span>
          )}
          {/* Location */}
          {item.location && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-zinc-500">
              📍 {item.location}
            </span>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{item.notes}</div>
        )}
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}
          className="p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-neon-rose"
        >
          <Trash2 size={14} />
        </button>
        <button
          className="p-1 rounded hover:bg-white/5 text-zinc-600 hover:text-zinc-300"
          onClick={(e) => { e.stopPropagation(); onClick?.(item); }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </motion.div>
  );
}
