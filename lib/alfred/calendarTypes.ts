export type CalendarEventType = "event" | "todo";

export interface CalendarEvent {
  id: string;

  type: CalendarEventType;

  title: string;

  startTime?: string;   // ISO string
  endTime?: string;     // ISO string

  deadline?: string;    // ISO string (for todos)

  durationMinutes?: number;

  repeat?: {
    frequency: "daily" | "weekly";
    daysOfWeek?: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
  };

  priority?: "low" | "medium" | "high";

  isDeleted: boolean;
}
