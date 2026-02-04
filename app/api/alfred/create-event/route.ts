import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, startTime, endTime, location, notes, repeat, repeatStart, repeatEnd, remindTime } = body;

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
        isDeleted: false,
        createdAt: new Date().toISOString(),
        repeat: repeat || null,
        repeatStart: repeatStart || null,
        repeatEnd: repeatEnd || null,
        remindTime: remindTime || null,
      });

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