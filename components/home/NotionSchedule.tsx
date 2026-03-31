"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarEvent } from "@/types/calendarTypes";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock, Trash2 } from "lucide-react";

interface NotionScheduleProps {
  items: CalendarEvent[];
  onComplete: (item: CalendarEvent) => void;
  onDelete: (item: CalendarEvent) => void;
  loading: boolean;
}

export function NotionSchedule({ items, onComplete, onDelete, loading }: NotionScheduleProps) {
  if (loading && items.length === 0) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-md w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground italic">
        Nothing scheduled for today. Enjoy the free time!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-accent/40 transition-colors cursor-pointer border border-transparent hover:border-border/50"
          >
            {/* Checkbox / Status */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(item);
              }}
              className="mt-1 text-muted-foreground hover:text-primary transition-colors"
            >
              {(item as any).isDone ? (
                <CheckCircle2 size={20} className="text-primary" />
              ) : (
                <Circle size={20} />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className={cn(
                "text-lg font-medium leading-tight text-foreground",
                (item as any).isDone && "line-through text-muted-foreground"
              )}>
                {item.title}
              </div>

              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                {item.startTime ? (
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      {new Date(item.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      {item.endTime && ` - ${new Date(item.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`}
                    </span>
                  </div>
                ) : item.deadline ? (
                  <div className="flex items-center gap-1 text-orange-500/80">
                    <Clock size={12} />
                    <span>Due {new Date(item.deadline).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                ) : null}

                {item.type === "event" && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                    Event
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item);
              }}
              className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
