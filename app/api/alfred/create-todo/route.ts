import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { userId, task, dueTime, priority } = body;

    if (!userId || !task) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection("todos").add({
      userId,
      task,
      dueTime: dueTime || null,
      priority: priority || "normal",
      isDone: false,
      createdAt: new Date().toISOString(),
    });

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