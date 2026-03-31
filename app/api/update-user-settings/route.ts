import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  try {
    const { userId, googleCalendarSyncEnabled } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Update the user's sync preference in Firestore
    await adminDb.collection('users').doc(userId).update({
      googleCalendarSyncEnabled: !!googleCalendarSyncEnabled
    });

    return NextResponse.json({ message: "Settings updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json({ error: "Failed to update user settings" }, { status: 500 });
  }
}
