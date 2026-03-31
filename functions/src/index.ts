// index.ts
import { setGlobalOptions } from "firebase-functions/v2";
import {
  onDocumentWritten,
  FirestoreEvent,
  Change,
} from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";

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

// ==================================================
// 🔥 TIMESTAMP NORMALIZERS / HELPERS
// ==================================================

/**
 * Normalize various possible shapes into a Firestore Timestamp or null.
 * Accepts:
 *  - admin.firestore.Timestamp (returned by SDK)
 *  - plain object with seconds/nanoseconds or _seconds/_nanoseconds (serialized)
 *  - JS Date
 *  - ISO string
 *  - epoch millis number
 */
function normalizeToTimestamp(value: any): Timestamp | null {
  if (!value && value !== 0) return null;

  // already Timestamp instance
  if (value instanceof Timestamp) return value;

  // plain serialized Firestore { _seconds, _nanoseconds } (emulator / REST shapes)
  if (
    typeof value === "object" &&
    (("_seconds" in value && "_nanoseconds" in value) ||
      ("seconds" in value && "nanoseconds" in value))
  ) {
    const seconds =
      typeof value._seconds !== "undefined" ? value._seconds : value.seconds;
    const nanos =
      typeof value._nanoseconds !== "undefined"
        ? value._nanoseconds
        : value.nanoseconds;

    // convert to milliseconds (rounding nanos -> ms)
    const millis = seconds * 1000 + Math.round(nanos / 1e6);
    return Timestamp.fromMillis(millis);
  }

  // JS Date
  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }

  // ISO string
  if (typeof value === "string") {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return Timestamp.fromDate(d);
    }
  }

  // epoch millis number
  if (typeof value === "number") {
    // assume milliseconds
    return Timestamp.fromMillis(value);
  }

  console.warn("normalizeToTimestamp: couldn't convert value:", value);
  return null;
}

/**
 * A safe wrapper used in the worker to avoid throwing on malformed remindTime.
 */
function safeToTimestamp(value: any): Timestamp | null {
  return normalizeToTimestamp(value);
}

// ==================================================
// 🔥 REMINDER HELPERS
// ==================================================

async function upsertReminder(payload: {
  userId: string;
  type: "event" | "todo";
  itemId: string;
  remindTime: Timestamp;
  title?: string;
}) {
  const id = `${payload.type}_${payload.userId}_${payload.itemId}`;
  const ref = db.collection("reminders").doc(id);

  // ensure remindTime is a Timestamp (defensive)
  const remindTs = normalizeToTimestamp(payload.remindTime);
  if (!remindTs) {
    throw new Error("Invalid remindTime provided to upsertReminder");
  }

  await ref.set(
    {
      userId: payload.userId,
      type: payload.type,
      itemId: payload.itemId,
      remindTime: remindTs,
      title: payload.title || null,
      status: "pending",
      createdAt: Timestamp.now(),
    },
    { merge: true }
  );
}

async function deleteReminder(
  type: "event" | "todo",
  userId: string,
  itemId: string
) {
  const id = `${type}_${userId}_${itemId}`;
  await db.collection("reminders").doc(id).delete().catch(() => { });
}

/**
 * Try to atomically lock a reminder for processing.
 * Returns true if we successfully set status=>processing.
 */
async function tryLockReminder(ref: admin.firestore.DocumentReference) {
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data();

    if (!data || data.status !== "pending") {
      return false;
    }

    tx.update(ref, {
      status: "processing",
      lockedAt: Timestamp.now(),
    });

    return true;
  });
}

// ==================================================
// 🔥 MIRROR: EVENTS → REMINDERS (with normalization)
// ==================================================

export const onEventChange = onDocumentWritten(
  "events/{userId}/all/{eventId}",
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { userId: string; eventId: string }
    >
  ) => {
    try {
      const after = event.data?.after;
      const userId = event.params.userId;
      const eventId = event.params.eventId;

      // deleted
      if (!after?.exists) {
        await deleteReminder("event", userId, eventId);
        return;
      }

      const data = after.data();

      const remindTs = normalizeToTimestamp(data?.remindTime);

      if (!remindTs) {
        // If no valid remindTime, ensure there is no reminder
        await deleteReminder("event", userId, eventId);
        return;
      }

      await upsertReminder({
        userId,
        type: "event",
        itemId: eventId,
        remindTime: remindTs,
        title: data?.title,
      });

      await rebuildFinalSchedule(userId);
    } catch (err) {
      console.error("onEventChange error:", err);
    }
  }
);

// ==================================================
// 🔥 MIRROR: TODOS → REMINDERS (with normalization)
// ==================================================

export const onTodoChange = onDocumentWritten(
  "todos/{userId}/all/{todoId}",
  async (
    event: FirestoreEvent<
      Change<DocumentSnapshot> | undefined,
      { userId: string; todoId: string }
    >
  ) => {
    try {
      const after = event.data?.after;
      const userId = event.params.userId;
      const todoId = event.params.todoId;

      // deleted
      if (!after?.exists) {
        await deleteReminder("todo", userId, todoId);
        return;
      }

      const data = after.data();

      const remindTs = normalizeToTimestamp(data?.remindTime);

      if (!remindTs) {
        // If no valid remindTime, ensure there is no reminder
        await deleteReminder("todo", userId, todoId);
        return;
      }

      await upsertReminder({
        userId,
        type: "todo",
        itemId: todoId,
        remindTime: remindTs,
        title: data?.title,
      });
      await rebuildFinalSchedule(userId);
    } catch (err) {
      console.error("onTodoChange error:", err);
    }
  }
);

// ==================================================
// 🚀 PRIORITY QUEUE POLLING WORKER (defensive)
// ==================================================

export const reminderWorker = onSchedule(
  {
    schedule: "every 1 minutes",
    timeZone: "UTC",
  },
  async () => {
    const now = Timestamp.now();
    console.log("⏰ Reminder worker running at", now.toDate().toISOString());

    let processed = 0;

    while (true) {
      // fetch earliest pending reminder only
      const snap = await db
        .collection("reminders")
        .where("status", "==", "pending")
        .orderBy("remindTime")
        .limit(1)
        .get();

      if (snap.empty) break;

      const doc = snap.docs[0];
      const data = doc.data();

      // defensively convert remindTime to Timestamp
      const remindTs = safeToTimestamp(data?.remindTime);

      // if invalid, mark failed and skip
      if (!remindTs) {
        console.error("Invalid remindTime for reminder doc:", doc.id, data?.remindTime);
        await doc.ref.update({
          status: "failed",
          failedAt: Timestamp.now(),
          error: "invalid remindTime",
        });
        continue;
      }

      // EARLY EXIT if earliest is in future
      if (remindTs.toMillis() > now.toMillis()) {
        break;
      }

      // atomic lock
      const locked = await tryLockReminder(doc.ref);
      if (!locked) continue;

      try {
        await triggerReminderAPI({
          userId: data.userId,
          type: data.type,
          itemId: data.itemId,
          title: data.title,
        });

        await doc.ref.update({
          status: "sent",
          sentAt: Timestamp.now(),
        });

        processed++;
      } catch (err) {
        console.error("Reminder failed for doc:", doc.id, err);

        await doc.ref.update({
          status: "failed",
          failedAt: Timestamp.now(),
          error: String(err || err),
        });
      }
    }

    console.log(`✅ Reminders processed: ${processed}`);
  }
);

// ==================================================
// 📡 EXTERNAL CALL TRIGGER
// ==================================================

async function triggerReminderAPI(payload: {
  userId?: string;
  type: "event" | "todo";
  itemId: string;
  title?: string;
}) {
  console.log("🔔 Triggering reminder:", payload);

  // REPLACE this URL with your production endpoint
  const res = await fetch(
    "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/reminder-call",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reminder API failed: ${res.status} ${text}`);
  }
}

// ==================================================
// 🔧 ONE-TIME MIGRATION: Convert old remindTime strings -> Timestamp
// ==================================================

/**
 * Call this HTTP endpoint once to migrate existing reminder docs that store
 * remindTime as string/number/Date shape into proper Firestore Timestamp objects.
 *
 * It runs in pages of `batchSize` docs to avoid timeouts. Idempotent.
 */
export const migrateReminders = onRequest(async (req, res) => {
  try {
    const batchSize = 500;
    let lastDoc: admin.firestore.QueryDocumentSnapshot | undefined = undefined;
    let totalUpdated = 0;
    let totalFailed = 0;

    while (true) {
      let query = db.collection("reminders").orderBy("__name__").limit(batchSize);
      if (lastDoc) query = query.startAfter(lastDoc);

      const snap = await query.get();
      if (snap.empty) break;

      for (const doc of snap.docs) {
        const data = doc.data();
        const remindTs = safeToTimestamp(data?.remindTime);

        if (remindTs) {
          // write normalized timestamp if it's not already a Timestamp instance
          // (we still do the write to ensure consistent shape)
          await doc.ref.update({
            remindTime: remindTs,
            // keep status if present; do not overwrite status here
            migratedAt: Timestamp.now(),
          });
          totalUpdated++;
        } else {
          // cannot parse -> mark as failed so it won't crash worker
          await doc.ref.update({
            status: "failed",
            failedAt: Timestamp.now(),
            error: "migrate: invalid remindTime",
          });
          totalFailed++;
        }
      }

      lastDoc = snap.docs[snap.docs.length - 1];

      // if fewer than batchSize, we finished
      if (snap.docs.length < batchSize) break;
    }

    res.status(200).send({
      ok: true,
      updated: totalUpdated,
      failed: totalFailed,
    });
  } catch (err) {
    console.error("migrateReminders error:", err);
    res.status(500).send({ ok: false, error: String(err || err) });
  }
});
