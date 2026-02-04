export type CalendarEventType = "event" | "todo";

export interface CalendarEvent {
  id: string;

  type: CalendarEventType;

  title: string;

  startTime?: string;   // ISO string
  endTime?: string;     // ISO string

  deadline?: string;    // ISO string (for todos)

  durationMinutes?: number;
  remindTime?: string; // ISO string
  repeat?: {
    frequency: "daily" | "weekly";
    daysOfWeek?: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
  };
  repeatStart: string | null; // ISO string
  repeatEnd: string | null;   // ISO string

  priority?: "low" | "medium" | "high";

  isDeleted: boolean;
}

export interface FinalSchedule {
  updatedAt: string;
  events: { id: string; ref: any }[];
  todos: { id: string; ref: any }[];
}

export interface TodoItem {
  id: string;
  title: string;
  type: "todo";
  deadline?: string;          // ISO string
  durationMinutes?: number;   // optional duration
  repeat?: {
    frequency: "daily" | "weekly";
    daysOfWeek?: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
  };
  priority?: "low" | "medium" | "high";
  remindTime?: string;     // ISO string
  isDone: boolean;
  isDeleted: boolean;
  ref?: any;                  // Firestore reference
}
