// components/TodoList.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "lucide-react";
import { capitalizeFirst } from "@/lib/utils/capitalize";
import type { CalendarEvent } from "@/types/calendarTypes";

type Props = {
  todos: CalendarEvent[];
  onComplete?: (t: CalendarEvent) => void;
  onDelete?: (t: CalendarEvent) => void;
};

export default function TodoList({ todos, onComplete, onDelete }: Props) {
  if (!todos.length) return <div className="text-sm text-slate-500">No pending todos</div>;

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center justify-between gap-3 bg-white rounded-xl p-3">
          <div>
            <div className="text-sm font-medium">{todo.title}</div>
            <div className="text-xs text-slate-500">
              {todo.deadline ? new Date(todo.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No deadline"}
            </div>
            {todo.priority && <div className="text-xs text-slate-400 mt-1">{capitalizeFirst(todo.priority)}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => onComplete?.(todo)}><Check size={14} /></Button>
            <Button variant="ghost" onClick={() => onDelete?.(todo)} className="text-red-600"><Trash2 size={14} /></Button>
          </div>
        </div>
      ))}
    </div>
  );
}
