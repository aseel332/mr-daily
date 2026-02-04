// app/api/alfred/complete-event/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

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

    await eventRef.update({ isDone: true });

    return NextResponse.json({ success: true, message: "Event marked as completed" });
  } catch (err: any) {
    console.error("complete-event error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
