// app/api/alfred/edit-event/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { eventId, userId, title, startTime, endTime, location, notes, priority } =
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

    await eventRef.update(updateData);

    return NextResponse.json({ success: true, updated: updateData });
  } catch (err: any) {
    console.error("edit-event error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
