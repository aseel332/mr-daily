// app/api/alfred/edit-event/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import { updateCalendarEvent } from "@/lib/google/calendarService";
import { generateRecurrenceRule } from "@/lib/google/recurrenceUtils";
import { isGoogleCalendarSyncEnabled } from "@/lib/google/syncGuard";

export async function POST(req: Request) {
  try {
    const { eventId, userId, title, startTime, endTime, location, notes, priority, color, repeat, repeatEnd } =
      await req.json();

    if (!eventId || !userId) {
      return NextResponse.json({ success: false, error: "Missing eventId or userId" }, { status: 400 });
    }

    const eventRef = adminDb.collection("events").doc(userId).collection("all").doc(eventId);
    const eventSnap = await eventRef.get();

    if (!eventSnap.exists) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (location !== undefined) updateData.location = location;
    if (notes !== undefined) updateData.notes = notes;
    if (priority !== undefined) updateData.priority = priority;
    if (color !== undefined) updateData.color = color;
    if (repeat !== undefined) updateData.repeat = repeat;
    if (repeatEnd !== undefined) updateData.repeatEnd = repeatEnd;

    await eventRef.update(updateData);

    // 🗓️ Sync to Google Calendar (best-effort, non-fatal)
    const { googleEventId } = (eventSnap.data() ?? {}) as { googleEventId?: string };
    if (googleEventId) {
      try {
        const isSyncEnabled = await isGoogleCalendarSyncEnabled(userId);
        if (isSyncEnabled) {
          const clerk = await clerkClient();
          const tokenRes = await clerk.users.getUserOauthAccessToken(userId, "google");
          const tokenResponse = tokenRes.data[0];
          if (tokenResponse?.token) {
            const recurrence = generateRecurrenceRule(repeat ?? eventSnap.data()?.repeat, repeatEnd ?? eventSnap.data()?.repeatEnd);
            await updateCalendarEvent(tokenResponse.token, googleEventId, {
              title,
              startTime,
              endTime,
              location,
              description: notes,
              recurrence,
            });
          }
        }
      } catch (calErr) {
        console.warn("[edit-event] Google Calendar sync skipped:", calErr);
      }
    }

    return NextResponse.json({ success: true, updated: updateData });
  } catch (err: any) {
    console.error("edit-event error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
