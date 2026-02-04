import { adminDb } from "@/lib/firebaseAdmin";
import { CalendarEvent, TodoItem, FinalSchedule } from "./calendarTypes"; // you can define FinalSchedule type

export async function getUserFinalSchedule(userId: string): Promise<FinalSchedule | null> {
  const docRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("finalSchedule")
    .doc("current");

  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    console.warn(`No final schedule found for user ${userId}`);
    return null;
  }

  // Return the final schedule data
  return docSnap.data() as FinalSchedule;
}
