import { FinalSchedule, CalendarEvent } from "./calendarTypes";
import { adminDb } from "@/lib/firebaseAdmin"; // your initialized admin.firestore()

/**
 * Takes a FinalSchedule object and returns a formatted summary string
 * for the AI agent, separating events and todos.
 * Resolves all Firestore references to get actual data.
 */
export async function formatFinalScheduleForAgent(finalSchedule: FinalSchedule | null): Promise<string> {
  if (!finalSchedule) {
    return "The user has no scheduled events or tasks.";
  }

  const events: CalendarEvent[] = [];

  // Resolve event references
  if (finalSchedule.events?.length) {
    for (const e of finalSchedule.events) {
      try {
        const docSnap = await adminDb.doc(e.ref.path).get();
        if (!docSnap.exists) continue;

        const data = docSnap.data();
        events.push({
          id: e.id,
          type: "event",
          title: data?.title || "Untitled Event",
          startTime: data?.startTime,
          endTime: data?.endTime,
          repeat: data?.repeat,
          priority: data?.priority,
          isDeleted: data?.isDeleted ?? false,
        });
      } catch (err) {
        console.warn(`Failed to fetch event ${e.id}`, err);
      }
    }
  }

  // Resolve todo references
  if (finalSchedule.todos?.length) {
    for (const t of finalSchedule.todos) {
      try {
        const docSnap = await adminDb.doc(t.ref.path).get();
        if (!docSnap.exists) continue;

        const data = docSnap.data();
        events.push({
          id: t.id,
          type: "todo",
          title: data?.task || "Untitled Todo",
          deadline: data?.deadline,
          repeat: data?.repeat,
          priority: data?.priority,
          isDeleted: data?.isDeleted ?? false,
        });
      } catch (err) {
        console.warn(`Failed to fetch todo ${t.id}`, err);
      }
    }
  }

  // Use formatting logic to generate AI-friendly summary
  return formatEventsForAgent(events);
}

/**
 * Existing function to format CalendarEvent[] for AI
 */
export function formatEventsForAgent(events: CalendarEvent[]): string {
  if (events.length === 0) return "The user has no scheduled events or tasks.";

  const calendarEvents = events.filter(e => e.type === "event");
  const todos = events.filter(e => e.type === "todo");

  let summary = "";

  if (calendarEvents.length > 0) {
    summary += "Scheduled Events:\n";
    calendarEvents.forEach((event, i) => {
      const timeInfo =
        event.startTime && event.endTime
          ? `from ${new Date(event.startTime).toLocaleString()} to ${new Date(event.endTime).toLocaleString()}`
          : "Time not specified";

      const repeatInfo = event.repeat
        ? `, repeats ${event.repeat.frequency}${event.repeat.daysOfWeek ? " on " + event.repeat.daysOfWeek.join(", ") : ""}`
        : "";

      summary += `${i + 1}. ${event.title} (eventId: ${event.id}),  ${timeInfo}${repeatInfo}`;
      if (event.priority) summary += `, priority: ${event.priority}`;
      summary += "\n";
    });
    summary += "\n";
  }

  if (todos.length > 0) {
    summary += "Pending Tasks (Todos):\n";
    todos.forEach((todo, i) => {
      const deadlineInfo = todo.deadline ? `deadline: ${new Date(todo.deadline).toLocaleString()}` : "no deadline";
      const repeatInfo = todo.repeat
        ? `, repeats ${todo.repeat.frequency}${todo.repeat.daysOfWeek ? " on " + todo.repeat.daysOfWeek.join(", ") : ""}`
        : "";
      summary += `${i + 1}. ${todo.title}, (todoId: ${todo.id}), ${deadlineInfo}${repeatInfo}`;
      if (todo.priority) summary += `, priority: ${todo.priority}`;
      summary += "\n";
    });
  }

  return summary.trim();
}
