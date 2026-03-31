"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import type { CalendarEvent } from "@/types/calendarTypes";
import { expandRecurringEvents } from "@/lib/utils/recurrence";

interface ScheduleContextType {
  schedule: CalendarEvent[];
  rawSchedule: CalendarEvent[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  reload: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [rawSchedule, setRawSchedule] = useState<CalendarEvent[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    if (!isSignedIn || !user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/get-schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error || "Failed to load schedule");
        setRawSchedule([]);
        setUpdatedAt(null);
      } else {
        setRawSchedule(json.schedule || []);
        setUpdatedAt(json.updatedAt || null);
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user, getToken]);

  // Initial fetch on mount (if user is signed in)
  useEffect(() => {
    if (isSignedIn && user && rawSchedule.length === 0) {
      fetchSchedule();
    }
  }, [isSignedIn, user, fetchSchedule, rawSchedule.length]);

  // Expand recurring events
  const schedule = useMemo(() => {
    if (!rawSchedule.length) return [];

    // Normalize raw items first so expandRecurringEvents can see 'deadline'
    const normalized = rawSchedule.map((s: any) => ({
      ...s,
      title: s.title ?? s.task ?? "Untitled",
      deadline: s.deadline ?? s.dueTime ?? null,
      startTime: s.startTime ?? null,
      endTime: s.endTime ?? null,
      color: s.color ?? null,
    })) as CalendarEvent[];

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 6, 1);

    return expandRecurringEvents(normalized, start, end);
  }, [rawSchedule]);

  const value = {
    schedule,
    rawSchedule,
    loading,
    error,
    updatedAt,
    reload: fetchSchedule
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useScheduleContext() {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error("useScheduleContext must be used within a ScheduleProvider");
  }
  return context;
}
