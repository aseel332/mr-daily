import { adminDb } from "@/lib/firebaseAdmin";
import { CalendarEvent } from "./calendarTypes";

export async function getUserCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const snapshot = await adminDb
    .collection("events")
    .where("userId", "==", userId)
    .where("isDeleted", "==", false)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as CalendarEvent[];
}
