import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  const authObj = await auth({ acceptsToken: "any" });

  // Type guard: make sure userId exists
  if (!("userId" in authObj) || !authObj.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = authObj.userId;

  try {
    const body = await req.json();
    const { email, fullName } = body;

    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return NextResponse.json({ status: "exists" }, { status: 200 });
    }

    await userRef.set({
      fullName,
      email,
      createdAt: new Date(),
    });

    return NextResponse.json({ status: "created" }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Firestore error", error: err.message },
      { status: 500 }
    );
  }
}
