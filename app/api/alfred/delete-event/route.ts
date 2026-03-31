// app/api/alfred/delete-event/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import { deleteCalendarEvent } from "@/lib/google/calendarService";
import { isGoogleCalendarSyncEnabled } from "@/lib/google/syncGuard";

export async function POST(req: Request) {
  try {
    const { eventId, userId } = await req.json();

    if (!eventId || !userId) {
      return NextResponse.json({ success: false, error: "Missing eventId or userId" }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(userId).collection("all").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const { googleEventId } = (eventSnap.data() ?? {}) as { googleEventId?: string };

    await eventRef.delete();

    // 🗓️ Sync to Google Calendar (best-effort, non-fatal)
    if (googleEventId) {
      try {
        const isSyncEnabled = await isGoogleCalendarSyncEnabled(userId);
        if (isSyncEnabled) {
          const clerk = await clerkClient();
          const tokenRes = await clerk.users.getUserOauthAccessToken(userId, "google");
          const tokenResponse = tokenRes.data[0];
          if (tokenResponse?.token) {
            await deleteCalendarEvent(tokenResponse.token, googleEventId);
          }
        }
      } catch (calErr) {
        console.warn("[delete-event] Google Calendar sync skipped:", calErr);
      }
    }

    return NextResponse.json({ success: true, message: "Event deleted successfully" });
  } catch (err: any) {
    console.error("delete-event error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
