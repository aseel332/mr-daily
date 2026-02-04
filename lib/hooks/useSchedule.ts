// lib/hooks/useSchedule.ts
import { useEffect, useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import type { CalendarEvent } from "@/types/calendarTypes";

export function useSchedule() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [schedule, setSchedule] = useState<CalendarEvent[]>([]);
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
        setSchedule([]);
        setUpdatedAt(null);
      } else {
        setSchedule(json.schedule || []);
        setUpdatedAt(json.updatedAt || null);
      }
    } catch (err: any) {
      setError(err?.message || "Network error");
      setSchedule([]);
      setUpdatedAt(null);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, user, getToken]);

  useEffect(() => {
    if (isSignedIn && user) fetchSchedule();
  }, [isSignedIn, user, fetchSchedule]);

  console.log("useSchedule:", { schedule, updatedAt, loading, error });
  return { schedule, updatedAt, loading, error, reload: fetchSchedule };
}
