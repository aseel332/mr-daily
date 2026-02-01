import { CalendarEvent } from "./calendarTypes";

export function formatEventsForAgent(events: CalendarEvent[]): string {
  if (events.length === 0) {
    return "No scheduled events or tasks.";
  }

  return events
    .map((event, index) => {
      if (event.type === "event") {
        return `${index + 1}. ${event.title} from ${event.startTime} to ${event.endTime}`;
      }

      return `${index + 1}. ${event.title}, deadline ${event.deadline}, priority ${event.priority}`;
    })
    .join("\n");
}
