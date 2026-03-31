import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import { createCalendarEvent } from "@/lib/google/calendarService";
import { generateRecurrenceRule } from "@/lib/google/recurrenceUtils";
import { isGoogleCalendarSyncEnabled } from "@/lib/google/syncGuard";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, startTime, endTime, location, notes, repeat, repeatStart, repeatEnd, remindTime, color } = body;

    if (!userId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log("Creating event:", title);

    // ✅ Store inside: events/{userId}/all/{eventId}
    const docRef = await adminDb
      .collection("events")
      .doc(userId)
      .collection("all")
      .add({
        title,
        startTime,
        endTime,
        location: location || "",
        notes: notes || "",
        color: color || "blue",
        isDeleted: false,
        createdAt: new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
        repeat: repeat || null,
        repeatStart: repeatStart || null,
        repeatEnd: repeatEnd || null,
        remindTime: remindTime || null,
        reminderSent: false,
        googleEventId: null, // will be updated below if OAuth token exists
      });

    // 🗓️ Sync to Google Calendar (best-effort, non-fatal)
    try {
      const isSyncEnabled = await isGoogleCalendarSyncEnabled(userId);
      if (isSyncEnabled) {
        const clerk = await clerkClient();
        const tokenRes = await clerk.users.getUserOauthAccessToken(userId, "google");
        const tokenResponse = tokenRes.data[0];
        if (tokenResponse?.token) {
          const recurrence = generateRecurrenceRule(repeat, repeatEnd);
          const googleEventId = await createCalendarEvent(tokenResponse.token, {
            title,
            startTime,
            endTime,
            location: location || "",
            description: notes || "",
            recurrence,
          });
          if (googleEventId) {
            await docRef.update({ googleEventId });
          }
        }
      } else {
        console.log(`[create-event] Google Calendar sync disabled for user ${userId}`);
      }
    } catch (calErr) {
      console.warn("[create-event] Google Calendar sync skipped:", calErr);
    }

    return NextResponse.json({
      success: true,
      eventId: docRef.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}