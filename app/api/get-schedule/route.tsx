// app/api/get-schedule/route.ts

import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    // ----------------------------------
    // Load final schedule doc
    // ----------------------------------

    const finalRef = adminDb
      .collection("users")
      .doc(userId)
      .collection("finalSchedule")
      .doc("current");

    const finalSnap = await finalRef.get();

    if (!finalSnap.exists) {
      return NextResponse.json({
        success: true,
        schedule: [],
      });
    }

    const finalData = finalSnap.data();
    
    if (!finalData) {
      return NextResponse.json({
        success: true,
        schedule: [],
      });
    }
    const eventsRefs = finalData?.events || [];
    const todosRefs = finalData?.todos || [];

    // ----------------------------------
    // Resolve references
    // ----------------------------------

    const eventDocs = await Promise.all(
      eventsRefs.map(async (e: any) => {
        try {
          const snap = await e.ref.get();
          if (!snap.exists) return null;

          const data = snap.data();

          if (data?.isDeleted) return null;

          return {
            id: snap.id,
            type: "event",
            ...data,
          };
        } catch {
          return null;
        }
      })
    );

    const todoDocs = await Promise.all(
      todosRefs.map(async (t: any) => {
        try {
          const snap = await t.ref.get();
          if (!snap.exists) return null;

          const data = snap.data();

          if (data?.isDone) return null;

          return {
            id: snap.id,
            type: "todo",
            ...data,
          };
        } catch {
          return null;
        }
      })
    );

    // ----------------------------------
    // Merge + sort chronologically
    // ----------------------------------

    const schedule = [...eventDocs, ...todoDocs]
      .filter(Boolean)
      .sort((a: any, b: any) => {
        const aTime =
          a.startTime || a.deadline
            ? new Date(a.startTime || a.deadline).getTime()
            : Infinity;

        const bTime =
          b.startTime || b.deadline
            ? new Date(b.startTime || b.deadline).getTime()
            : Infinity;

        return aTime - bTime;
      });

    return NextResponse.json({
      success: true,
      schedule,
      updatedAt: finalData.updatedAt || null,
    });
  } catch (err: any) {
    console.error("get-schedule error:", err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 }
    );
  }
}
