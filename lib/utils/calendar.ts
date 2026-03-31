/** Calendar date utility functions */

/** Get the start of the week (Sunday) for a given date */
export function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const diff = copy.getDate() - copy.getDay();
  return new Date(copy.setDate(diff));
}

/** Get 7 consecutive dates starting from a given date */
export function getWeekDates(start: Date): Date[] {
  const arr: Date[] = [];
  for (let i = 0; i < 7; i++) {
    arr.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return arr;
}

/** Generate a month grid (with null padding for alignment) */
export function getMonthGrid(viewDate: Date): (Date | null)[] {
  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
  const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
  const firstWeekday = monthStart.getDay();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    cells.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Build a map of date-string → events for quick lookup */
import type { CalendarEvent } from "@/types/calendarTypes";

export function getEventsByDay(schedule: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of schedule) {
    const dt = ev.startTime || ev.deadline || null;
    if (!dt) continue;
    const key = new Date(dt).toLocaleDateString("en-CA"); // YYYY-MM-DD local
    const arr = map.get(key) || [];
    arr.push(ev);
    map.set(key, arr);
  }
  return map;
}

/** Format hour number to display string */
export function formatHour(h: number): string {
  if (h === 0) return "12a";
  if (h < 12) return `${h}a`;
  if (h === 12) return "12p";
  return `${h - 12}p`;
}

/** Get the CSS color class for an event */
export function getEventColorClass(color?: string | null): string {
  const colorMap: Record<string, string> = {
    blue: "event-color-blue",
    cyan: "event-color-cyan",
    violet: "event-color-violet",
    green: "event-color-green",
    amber: "event-color-amber",
    rose: "event-color-rose",
    red: "event-color-red",
    orange: "event-color-orange",
  };
  return colorMap[color || "blue"] || "event-color-blue";
}

/** Get event background and text colors for calendar chips */
export function getEventChipStyle(color?: string | null) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: "bg-blue-500/15", text: "text-blue-300", border: "border-blue-500/30" },
    cyan: { bg: "bg-cyan-400/15", text: "text-cyan-300", border: "border-cyan-400/30" },
    violet: { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/30" },
    green: { bg: "bg-emerald-500/15", text: "text-emerald-300", border: "border-emerald-500/30" },
    amber: { bg: "bg-amber-500/15", text: "text-amber-300", border: "border-amber-500/30" },
    rose: { bg: "bg-rose-500/15", text: "text-rose-300", border: "border-rose-500/30" },
    red: { bg: "bg-red-500/15", text: "text-red-300", border: "border-red-500/30" },
    orange: { bg: "bg-orange-500/15", text: "text-orange-300", border: "border-orange-500/30" },
  };
  return styles[color || "blue"] || styles.blue;
}
