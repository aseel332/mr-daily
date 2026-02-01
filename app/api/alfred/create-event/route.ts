import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin"; // your firebase admin init

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, title, startTime, endTime, location, notes } = body;

    if (!userId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = await adminDb
      .collection("events")
      .add({
        userId,
        title,
        startTime,
        endTime,
        location: location || "",
        notes: notes || "",
        isDeleted: false,
        createdAt: new Date().toISOString(),
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