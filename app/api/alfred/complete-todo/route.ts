import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import { updateCalendarEvent } from "@/lib/google/calendarService";
import { isGoogleCalendarSyncEnabled } from "@/lib/google/syncGuard";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, todoId } = body;

    if (!userId || !todoId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = adminDb
      .collection("todos")
      .doc(userId)
      .collection("all")
      .doc(todoId);

    const todoSnap = await docRef.get();
    const todoData = (todoSnap.data() ?? {}) as { googleEventId?: string; task?: string };

    await docRef.update({
      isDone: true,
      completedAt: new Date().toISOString()
    });

    // 🗓️ Sync to Google Calendar – append [DONE] to event title (best-effort, non-fatal)
    if (todoData.googleEventId) {
      try {
        const isSyncEnabled = await isGoogleCalendarSyncEnabled(userId);
        if (isSyncEnabled) {
          const clerk = await clerkClient();
          const tokenRes = await clerk.users.getUserOauthAccessToken(userId, "google");
          const tokenResponse = tokenRes.data[0];
          if (tokenResponse?.token) {
            await updateCalendarEvent(tokenResponse.token, todoData.googleEventId, {
              title: `[DONE] ${todoData.task ?? "Task"}`,
            });
          }
        }
      } catch (calErr) {
        console.warn("[complete-todo] Google Calendar sync skipped:", calErr);
      }
    }

    return NextResponse.json({
      success: true,
      todoId
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
