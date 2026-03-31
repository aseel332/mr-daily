// app/todos/page.tsx
"use client";

import React, { useMemo } from "react";
import { useSchedule } from "@/lib/hooks/useSchedule";
import { useUser, useAuth } from "@clerk/nextjs";
import type { CalendarEvent } from "@/types/calendarTypes";
import { CheckSquare, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NeonContainer } from "@/components/home/NeonContainer";
import { NotionBlock } from "@/components/NotionBlock";

export default function TodosPage() {
  const { schedule, loading, reload } = useSchedule();
  const { user } = useUser();
  const { getToken } = useAuth();

  const todos = useMemo(
    () => schedule
      .filter((s) => s.type === "todo")
      .sort((a, b) => {
        const aD = (a as any).isDone ? 1 : 0;
        const bD = (b as any).isDone ? 1 : 0;
        if (aD !== bD) return aD - bD;
        const at = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bt = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return at - bt;
      }),
    [schedule]
  );

  const pending = todos.filter((t) => !(t as any).isDone);
  const done = todos.filter((t) => (t as any).isDone);

  async function markComplete(item: CalendarEvent) {
    if (!user) return;
    try {
      const token = await getToken();
      const originalId = item.id.split("_")[0];
      await fetch("/api/alfred/complete-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, todoId: originalId }),
      });
      reload();
    } catch (err) { console.error(err); }
  }

  async function deleteItem(item: CalendarEvent) {
    if (!user || !confirm("Delete this task?")) return;
    try {
      const token = await getToken();
      const originalId = item.id.split("_")[0];
      await fetch("/api/alfred/delete-todo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, todoId: originalId }),
      });
      reload();
    } catch (err) { console.error(err); }
  }

  return (
    <div className="min-h-screen p-6 md:p-10 lg:max-w-3xl lg:mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <CheckSquare size={24} className="text-neon-violet" />
          <h1 className="text-2xl font-bold text-zinc-100">Tasks</h1>
          <span className="text-xs font-medium text-zinc-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            {pending.length} pending
          </span>
        </div>
        <button
          onClick={() => reload()}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-neon-cyan transition-colors disabled:opacity-40"
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin")} />
        </button>
      </motion.div>

      {/* Pending */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <NeonContainer title="Pending" icon={CheckSquare} badge={pending.length} accent="violet">
          {loading && !schedule.length ? (
            <div className="py-6 text-center text-zinc-500 text-sm">Loading tasks...</div>
          ) : pending.length === 0 ? (
            <div className="py-6 text-center text-zinc-600 text-sm italic">All caught up! 🎉</div>
          ) : (
            <div className="space-y-0.5">
              <AnimatePresence mode="popLayout">
                {pending.map((item) => (
                  <NotionBlock key={item.id} item={item} onComplete={markComplete} onDelete={deleteItem} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </NeonContainer>
      </motion.div>

      {/* Done */}
      {done.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
          <NeonContainer title="Completed" badge={done.length} accent="cyan" className="opacity-60 hover:opacity-100 transition-opacity">
            <div className="space-y-0.5">
              {done.map((item) => (
                <NotionBlock key={item.id} item={item} onDelete={deleteItem} />
              ))}
            </div>
          </NeonContainer>
        </motion.div>
      )}
    </div>
  );
}
