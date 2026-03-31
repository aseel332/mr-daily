/**
 * Converts Alfred's repeat object into a Google Calendar compatible RRULE string array.
 * 
 * Alfred Repeat Format (from calendarTypes.ts):
 * repeat?: {
 *   frequency: "daily" | "weekly";
 *   daysOfWeek?: ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")[];
 * };
 * repeatEnd: string | null; // ISO string
 */
export function generateRecurrenceRule(repeat: any, repeatEnd: string | null): string[] | undefined {
  if (!repeat || !repeat.frequency) return undefined;

  let rrule = `RRULE:FREQ=${repeat.frequency.toUpperCase()}`;

  if (repeat.frequency === "weekly" && repeat.daysOfWeek && repeat.daysOfWeek.length > 0) {
    const daysMap: Record<string, string> = {
      Mon: "MO",
      Tue: "TU",
      Wed: "WE",
      Thu: "TH",
      Fri: "FR",
      Sat: "SA",
      Sun: "SU",
    };
    const days = repeat.daysOfWeek.map((day: string) => daysMap[day]).join(",");
    rrule += `;BYDAY=${days}`;
  }

  if (repeatEnd) {
    // Google RRULE UNTIL must be in UTC YYYYMMDDTHHMMSSZ format
    // Ensure we are using UTC even if the input string is local
    const endDate = new Date(repeatEnd);
    const until = endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    rrule += `;UNTIL=${until}`;
  }

  return [rrule];
}
