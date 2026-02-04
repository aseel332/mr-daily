import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

// function to update phone number to user profile
export async function POST(request: Request) {
  const { phoneNumber, userId } = await request.json();

  try {
    // Update the user's phone number in the database
    await adminDb.collection('users').doc(userId).update({ phoneNumber });

    return NextResponse.json({ message: "Phone number updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating phone number:", error);
    return NextResponse.json({ error: "Failed to update phone number" }, { status: 500 });
  }
}