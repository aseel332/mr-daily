import type { CalendarEvent } from "@/types/calendarTypes";

/** Normalize raw schedule items (handle legacy field names) */
export function normalizeScheduleItem(s: any): CalendarEvent {
  return {
    ...s,
    title: s.title ?? s.task ?? "Untitled",
    deadline: s.deadline ?? s.dueTime ?? null,
  } as CalendarEvent;
}

/** Get items for today, sorted by time */
export function getTodayItems(schedule: CalendarEvent[]): CalendarEvent[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const startOfDay = now.getTime();
  const endOfDay = startOfDay + 86400000;

  return schedule
    .filter((item) => {
      const t = item.startTime
        ? new Date(item.startTime).getTime()
        : item.deadline
          ? new Date(item.deadline).getTime()
          : null;
      return t !== null && t >= startOfDay && t < endOfDay;
    })
    .sort((a, b) => {
      const at = a.startTime || a.deadline || "";
      const bt = b.startTime || b.deadline || "";
      return new Date(at).getTime() - new Date(bt).getTime();
    });
}

/** Get upcoming items (after today), limited */
export function getUpcomingItems(schedule: CalendarEvent[], limit = 10): CalendarEvent[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const endOfToday = now.getTime() + 86400000;

  return schedule
    .filter((item) => {
      const t = item.startTime
        ? new Date(item.startTime).getTime()
        : item.deadline
          ? new Date(item.deadline).getTime()
          : null;
      return t !== null && t >= endOfToday;
    })
    .sort((a, b) => {
      const at = a.startTime || a.deadline || "";
      const bt = b.startTime || b.deadline || "";
      return new Date(at).getTime() - new Date(bt).getTime();
    })
    .slice(0, limit);
}

/** Get time-of-day greeting */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** Get the next upcoming event (from now) */
export function getNextEvent(schedule: CalendarEvent[]): CalendarEvent | null {
  const now = Date.now();
  const future = schedule
    .filter((item) => {
      const t = item.startTime ? new Date(item.startTime).getTime() : null;
      return t !== null && t > now;
    })
    .sort((a, b) => new Date(a.startTime!).getTime() - new Date(b.startTime!).getTime());
  return future[0] || null;
}
