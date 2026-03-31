import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import { createTodoCalendarEvent } from "@/lib/google/calendarService";
import { generateRecurrenceRule } from "@/lib/google/recurrenceUtils";
import { isGoogleCalendarSyncEnabled } from "@/lib/google/syncGuard";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, task, dueTime, priority, repeat, repeatEnd } = body;

    if (!userId || !task) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = await adminDb
      .collection("todos")
      .doc(userId)
      .collection("all")
      .add({
        task,
        dueTime: dueTime || null,
        priority: priority || "normal",
        isDone: false,
        createdAt: new Date().toISOString(),
        repeat: repeat || null,
        repeatEnd: repeatEnd || null,
        googleEventId: null, // will be updated below if OAuth token + dueTime exists
      });

    // 🗓️ Sync to Google Calendar as a 10-minute block (best-effort, non-fatal)
    if (dueTime) {
      try {
        const isSyncEnabled = await isGoogleCalendarSyncEnabled(userId);
        if (isSyncEnabled) {
          const clerk = await clerkClient();
          const tokenRes = await clerk.users.getUserOauthAccessToken(userId, "google");
          const tokenResponse = tokenRes.data[0];
          if (tokenResponse?.token) {
            const recurrence = generateRecurrenceRule(repeat, repeatEnd);
            const googleEventId = await createTodoCalendarEvent(tokenResponse.token, task, dueTime, recurrence);
            if (googleEventId) {
              await docRef.update({ googleEventId });
            }
          }
        }
      } catch (calErr) {
        console.warn("[create-todo] Google Calendar sync skipped:", calErr);
      }
    }

    return NextResponse.json({
      success: true,
      todoId: docRef.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}