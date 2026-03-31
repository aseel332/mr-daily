import { adminDb } from "@/lib/firebaseAdmin";

/**
 * Checks if Google Calendar sync is enabled for a specific user in Firestore.
 */
export async function isGoogleCalendarSyncEnabled(userId: string): Promise<boolean> {
  try {
    const userDoc = await adminDb.collection("users").doc(userId).get();
    if (!userDoc.exists) return false;

    const userData = userDoc.data();
    return !!userData?.googleCalendarSyncEnabled;
  } catch (error) {
    console.error(`[syncGuard] Error checking sync status for user ${userId}:`, error);
    return false;
  }
}
