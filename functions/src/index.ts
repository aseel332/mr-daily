import { setGlobalOptions } from "firebase-functions/v2";

import {
  onDocumentWritten,
  FirestoreEvent,
  Change,
} from "firebase-functions/v2/firestore";

import { onSchedule } from "firebase-functions/v2/scheduler";

import * as admin from "firebase-admin";
import { DocumentSnapshot, Timestamp } from "firebase-admin/firestore";


// --------------------------------------------------
// Firebase Init
// --------------------------------------------------

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: "alfred-8cf04",
});

const db = admin.firestore();

setGlobalOptions({ maxInstances: 10 });

// --------------------------------------------------
// Helper: rebuild final schedule
// --------------------------------------------------

async function rebuildFinalSchedule(userId: string) {
  if (!userId) return;

  console.log("Rebuilding schedule for:", userId);

  const eventsSnap = await db
    .collection("events")
    .doc(userId)
    .collection("all")
    .where("isDeleted", "==", false)
    .get();

  const todosSnap = await db
    .collection("todos")
    .doc(userId)
    .collection("all")
    .where("isDone", "==", false)
    .get();

  const finalScheduleRef = db
    .collection("users")
    .doc(userId)
    .collection("finalSchedule")
    .doc("current");

  const scheduleData = {
    updatedAt: new Date().toISOString(),

    events: eventsSnap.docs.map((doc) => ({
      id: doc.id,
      ref: doc.ref,
    })),

    todos: todosSnap.docs.map((doc) => ({
      id: doc.id,
      ref: doc.ref,
    })),
  };

  await finalScheduleRef.set(scheduleData, { merge: true });
}

// --------------------------------------------------
// Firestore triggers
// --------------------------------------------------

export const onEventChange = onDocumentWritten(
  "events/{userId}/all/{eventId}",
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { userId: string; eventId: string }
    >
  ) => {
    const userId = event.params.userId;
    await rebuildFinalSchedule(userId);
  }
);

export const onTodoChange = onDocumentWritten(
  "todos/{userId}/all/{todoId}",
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { userId: string; todoId: string }
    >
  ) => {
    const userId = event.params.userId;
    await rebuildFinalSchedule(userId);
  }
);

// --------------------------------------------------
// Reminder Scheduler (runs every minute)
// --------------------------------------------------

export const reminderWorker = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "UTC",
  },
  async () => {
    const now = Timestamp.now();

    console.log("⏰ Reminder worker running at", now.toDate().toISOString());

    const batch = db.batch();

    // ---------------- EVENTS ----------------

    const eventsSnap = await db
      .collectionGroup("all")
      .where("remindTime", "<=", now)
      .where("reminderSent", "==", false)
      .get();

    for (const doc of eventsSnap.docs) {
      const data = doc.data();

      const userId = doc.ref.parent.parent?.id;

      await triggerReminderAPI({
        userId,
        type: "event",
        itemId: doc.id,
        title: data.title,
      });

      batch.update(doc.ref, {
        reminderSent: true,
        reminderTriggeredAt: Timestamp.now(),
      });
    }

    // ---------------- TODOS ----------------

    const todosSnap = await db
      .collectionGroup("all")
      .where("remindTime", "<=", now)
      .where("reminderSent", "==", false)
      .get();

    for (const doc of todosSnap.docs) {
      const data = doc.data();

      const userId = doc.ref.parent.parent?.id;

      await triggerReminderAPI({
        userId,
        type: "todo",
        itemId: doc.id,
        title: data.title,
      });

      batch.update(doc.ref, {
        reminderSent: true,
        reminderTriggeredAt: Timestamp.now(),
      });
    }

    await batch.commit();

    console.log(
      `✅ Reminders processed: ${
        eventsSnap.size + todosSnap.size
      } items`
    );
  }
);

// --------------------------------------------------
// External API call
// --------------------------------------------------

async function triggerReminderAPI(payload: {
  userId?: string;
  type: "event" | "todo";
  itemId: string;
  title?: string;
}) {
  console.log("🔔 Triggering reminder:", payload);

  const res = await fetch("https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/reminder-call", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reminder API failed: ${res.status} ${text}`);
  }
}

