// app/api/alfred/delete-event/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { todoId, userId } = await req.json();

    if (!todoId || !userId) {
      return NextResponse.json({ success: false, error: "Missing todoId or userId" }, { status: 400 });
    }

    const todoRef = adminDb.collection("todos").doc(userId).collection("all").doc(todoId);
    const todoSnap = await todoRef.get();
    if (!todoSnap.exists) {
      return NextResponse.json({ success: false, error: "Todo not found" }, { status: 404 });
    }

    await todoRef.delete();

    return NextResponse.json({ success: true, message: "Todo deleted successfully" });
  } catch (err: any) {
    console.log(err);
    console.error("delete-todo error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
