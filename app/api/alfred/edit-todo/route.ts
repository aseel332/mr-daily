import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { clerkClient } from "@clerk/nextjs/server";
import { updateCalendarEvent, deleteCalendarEvent, createTodoCalendarEvent } from "@/lib/google/calendarService";
import { generateRecurrenceRule } from "@/lib/google/recurrenceUtils";
import { isGoogleCalendarSyncEnabled } from "@/lib/google/syncGuard";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, todoId, task, dueTime, priority, isDone, repeat, repeatEnd } = body;

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
    const { googleEventId } = (todoSnap.data() ?? {}) as { googleEventId?: string };

    const updates: any = {};
    if (task !== undefined) updates.task = task;
    if (dueTime !== undefined) updates.dueTime = dueTime || null;
    if (priority !== undefined) updates.priority = priority;
    if (isDone !== undefined) updates.isDone = isDone;
    if (repeat !== undefined) updates.repeat = repeat;
    if (repeatEnd !== undefined) updates.repeatEnd = repeatEnd;

    await docRef.update(updates);

    // 🗓️ Sync to Google Calendar (best-effort, non-fatal)
    try {
      const isSyncEnabled = await isGoogleCalendarSyncEnabled(userId);
      if (isSyncEnabled) {
        const clerk = await clerkClient();
        const tokenRes = await clerk.users.getUserOauthAccessToken(userId, "google");
        const token = tokenRes.data[0]?.token;

        if (token) {
          if (googleEventId) {
            // Update existing calendar event
            const calUpdates: any = {};
            if (task !== undefined) calUpdates.title = `[Task] ${task}`;

            const currentDueTime = dueTime ?? todoSnap.data()?.dueTime;
            if (currentDueTime) {
              const endTime = new Date(currentDueTime);
              const startTime = new Date(endTime.getTime() - 10 * 60 * 1000);
              calUpdates.startTime = startTime.toISOString();
              calUpdates.endTime = endTime.toISOString();
            }

            if (repeat !== undefined || repeatEnd !== undefined) {
              calUpdates.recurrence = generateRecurrenceRule(
                repeat ?? todoSnap.data()?.repeat,
                repeatEnd ?? todoSnap.data()?.repeatEnd
              );
            }

            await updateCalendarEvent(token, googleEventId, calUpdates);
          } else if (dueTime || todoSnap.data()?.dueTime) {
            // No existing calendar event – create one now (e.g. dueTime was just added or it's a new repeating todo)
            const recurrence = generateRecurrenceRule(repeat ?? todoSnap.data()?.repeat, repeatEnd ?? todoSnap.data()?.repeatEnd);
            const newGoogleEventId = await createTodoCalendarEvent(
              token,
              task ?? todoSnap.data()?.task,
              dueTime ?? todoSnap.data()?.dueTime,
              recurrence
            );
            if (newGoogleEventId) {
              await docRef.update({ googleEventId: newGoogleEventId });
            }
          }
        }
      }
    } catch (calErr) {
      console.warn("[edit-todo] Google Calendar sync skipped:", calErr);
    }

    return NextResponse.json({
      success: true,
      todoId,
      updatedFields: updates
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
