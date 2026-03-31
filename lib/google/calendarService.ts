import { google } from "googleapis";

/**
 * Returns an authenticated Google Calendar client using a user's OAuth access token.
 */
function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

export interface CalendarEventInput {
  title: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  location?: string;
  description?: string;
  recurrence?: string[]; // RRULE strings
}

/**
 * Creates an event in Google Calendar. Returns the created event's ID.
 */
export async function createCalendarEvent(
  accessToken: string,
  event: CalendarEventInput
): Promise<string | null> {
  try {
    const calendar = getCalendarClient(accessToken);
    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        location: event.location,
        description: event.description,
        start: {
          dateTime: event.startTime,
          timeZone: "America/Los_Angeles"
        },
        end: {
          dateTime: event.endTime,
          timeZone: "America/Los_Angeles"
        },
        recurrence: event.recurrence,
      },
    });
    return response.data.id ?? null;
  } catch (err) {
    console.error("[calendarService] createCalendarEvent error:", err);
    return null;
  }
}

/**
 * Updates an existing Google Calendar event.
 */
export async function updateCalendarEvent(
  accessToken: string,
  googleEventId: string,
  updates: Partial<CalendarEventInput>
): Promise<void> {
  try {
    const calendar = getCalendarClient(accessToken);
    const patch: Record<string, any> = {};
    if (updates.title !== undefined) patch.summary = updates.title;
    if (updates.location !== undefined) patch.location = updates.location;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.startTime !== undefined) patch.start = {
      dateTime: updates.startTime,
      timeZone: "America/Los_Angeles"
    };
    if (updates.endTime !== undefined) patch.end = {
      dateTime: updates.endTime,
      timeZone: "America/Los_Angeles"
    };
    if (updates.recurrence !== undefined) patch.recurrence = updates.recurrence;

    await calendar.events.patch({
      calendarId: "primary",
      eventId: googleEventId,
      requestBody: patch,
    });
  } catch (err) {
    console.error("[calendarService] updateCalendarEvent error:", err);
  }
}

/**
 * Deletes a Google Calendar event by ID.
 */
export async function deleteCalendarEvent(
  accessToken: string,
  googleEventId: string
): Promise<void> {
  try {
    const calendar = getCalendarClient(accessToken);
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });
  } catch (err) {
    console.error("[calendarService] deleteCalendarEvent error:", err);
  }
}

/**
 * Creates a 10-minute "Todo" event ending exactly at dueTime.
 * Title format: [Task] {task name}
 */
export async function createTodoCalendarEvent(
  accessToken: string,
  task: string,
  dueTime: string, // ISO 8601
  recurrence?: string[] // RRULE strings
): Promise<string | null> {
  const endTime = new Date(dueTime);
  const startTime = new Date(endTime.getTime() - 10 * 60 * 1000); // 10 minutes before

  return createCalendarEvent(accessToken, {
    title: `[Task] ${task}`,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    description: "Auto-created by Alfred",
    recurrence,
  });
}
