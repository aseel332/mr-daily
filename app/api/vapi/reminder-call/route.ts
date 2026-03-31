import { buildAlfredSystemPrompt } from "@/lib/alfred/prompt";
import { adminDb } from "@/lib/firebaseAdmin";
import { vapi } from "@/lib/vapi";
import { NextResponse } from "next/server";
import { getAlfredTools } from "@/lib/alfred/tools";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload?.type;
    const userId = payload?.userId;
    const eventId = payload?.itemId;


    // getting user phone number for reminder call
    const userDoc = await adminDb.collection("users").doc(userId).get();
    const userData = userDoc.data();
    const phoneNumber = userData?.phoneNumber;
    const name = userData?.fullName?.split(" ")[0] || "there";
    console.log("Reminder Call Payload:", { payload, phoneNumber });

    if (!userId || !eventId || !eventType || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    console.log("User Data:", userData);

    const callReason = "reminder" as const;
    // Trigger VAPI Call
    const systemPrompt = await buildAlfredSystemPrompt({
      name: name,
      userId: userId,
      callReason,
    });

    // starting vapi call using vapi sdk
    const call = await vapi.calls.create({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID!,
      customer: {
        number: phoneNumber,
        name: name,
      },
      assistant: {
        model: {
          provider: "openai",
          model: "gpt-4o",
          tools: getAlfredTools() as any,
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: systemPrompt
            }
          ],


        },

        voice: {
          provider: "vapi",
          voiceId: "Elliot",
        },
        firstMessage: `Hey ${name}, this is Alfred. I'm calling to remind you about your ${eventType} titled "${payload.title}".`,

      },

    });
    return NextResponse.json({ success: true, });
  } catch (error: any) {
    console.error("Error in reminder call:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
