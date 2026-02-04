// types/calendarTypes.ts
export type CalendarEventType = "event" | "todo";

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  startTime?: string | null;   // ISO
  endTime?: string | null;     // ISO
  deadline?: string | null;    // ISO for todos
  durationMinutes?: number;
  remindTime?: string | null; // ISO
  repeat?: {
    frequency: "daily" | "weekly";
    daysOfWeek?: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
  };
  repeatStart: string | null; // ISO string
  repeatEnd: string | null;   // ISO string
  priority?: "low" | "medium" | "high" | string | null;
  location?: string | null;
  notes?: string | null;
  isDeleted?: boolean;
  isDone?: boolean;
}
