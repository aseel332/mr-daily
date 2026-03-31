import { CalendarEvent } from "@/types/calendarTypes";

/**
 * Expands recurring events within a given range.
 * @param events - List of all events (some may be recurring)
 * @param start - Start of the range (Date)
 * @param end - End of the range (Date)
 * @returns - A flat list of event instances, sorted by start time.
 */
export function expandRecurringEvents(
  events: CalendarEvent[],
  start: Date,
  end: Date,
  timezone?: string
): CalendarEvent[] {
  const instances: CalendarEvent[] = [];
  const rangeStart = start.getTime();
  const rangeEnd = end.getTime();

  for (const event of events) {
    if (!event.startTime && !event.deadline) continue;

    // Base start time of the event
    // For Todos using deadline, treat it as start time for recurrence purposes
    const baseDate = new Date(event.startTime || event.deadline!);
    const duration = event.endTime
      ? new Date(event.endTime).getTime() - baseDate.getTime()
      : (event.durationMinutes || 60) * 60000;

    // 1. Non-recurring
    if (!event.repeat) {
      const t = baseDate.getTime();
      if (t >= rangeStart && t <= rangeEnd) {
        instances.push(event);
      }
      continue;
    }

    // 2. Recurring
    // Determine effective start for expansion
    // If repeatStart is set, use it. Otherwise use event start.
    let pointer = event.repeatStart ? new Date(event.repeatStart) : new Date(baseDate);

    // Safety: ensure pointer has the same time-of-day as baseDate if it was just a date string?
    // Assuming ISO strings preserve time. If repeatStart is YYYY-MM-DD, it might default to 00:00.
    // Let's force pointer to matches baseDate's time of day
    pointer.setHours(baseDate.getHours(), baseDate.getMinutes(), baseDate.getSeconds(), baseDate.getMilliseconds());

    // Stop expansion at repeatEnd or rangeEnd, whichever comes FIRST?
    // Actually, we want to expand UP TO repeatEnd. If repeatEnd is null, we expand UP TO rangeEnd.
    // If repeatEnd is BEFORE rangeEnd, we stop at repeatEnd.
    let limitTime = rangeEnd;
    if (event.repeatEnd) {
      limitTime = Math.min(rangeEnd, new Date(event.repeatEnd).getTime());
    }

    // If repeatStart is in future beyond range, skip
    if (pointer.getTime() > limitTime) continue;

    // Backtrack safety: if pointer is way before rangeStart, we need to advance it efficiently.
    if (pointer.getTime() < rangeStart) {
      if (event.repeat.frequency === "daily") {
        const msPerDay = 86400000;
        const diffDays = Math.floor((rangeStart - pointer.getTime()) / msPerDay);
        if (diffDays > 0) pointer.setDate(pointer.getDate() + diffDays);
      } else if (event.repeat.frequency === "weekly") {
        const msPerWeek = 86400000 * 7;
        const diffWeeks = Math.floor((rangeStart - pointer.getTime()) / msPerWeek);
        if (diffWeeks > 0) pointer.setDate(pointer.getDate() + diffWeeks * 7);
      }
    }

    let count = 0;
    while (count < 5000) { // Safety break
      const t = pointer.getTime();

      // If we passed the limit, stop
      if (t > limitTime) break;

      // Check if current pointer matches recurrence rules
      let matches = true;

      if (event.repeat.frequency === "weekly") {
        if (event.repeat.daysOfWeek && event.repeat.daysOfWeek.length > 0) {
          const DayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const dayName = DayMap[pointer.getDay()];
          if (!event.repeat.daysOfWeek.includes(dayName as any)) {
            matches = false;
          }
        }
      }

      // If matches and within view range, add instance
      if (matches && t >= rangeStart && t <= limitTime) {
        // Create instance
        const instanceStart = new Date(pointer);
        const instanceEnd = new Date(t + duration);

        instances.push({
          ...event,
          id: `${event.id}_${instanceStart.toISOString()}`,
          startTime: event.startTime ? instanceStart.toISOString() : undefined,
          deadline: event.deadline ? instanceStart.toISOString() : undefined,
          endTime: event.endTime ? instanceEnd.toISOString() : undefined,
        });
      }

      // Advance
      count++;

      if (event.repeat.frequency === "daily") {
        pointer.setDate(pointer.getDate() + 1);
      } else if (event.repeat.frequency === "weekly") {
        if (event.repeat.daysOfWeek && event.repeat.daysOfWeek.length > 0) {
          // If we are checking specific days, we iterate DAILY and check membership
          pointer.setDate(pointer.getDate() + 1);
        } else {
          // Simple weekly (+7 days)
          pointer.setDate(pointer.getDate() + 7);
        }
      } else {
        // Fallback or unknown frequency to avoid infinite loop
        break;
      }
    }
  }

  return instances.sort((a, b) => {
    const at = a.startTime || a.deadline || "";
    const bt = b.startTime || b.deadline || "";
    return new Date(at).getTime() - new Date(bt).getTime();
  });
}
