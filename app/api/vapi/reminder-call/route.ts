import { buildAlfredSystemPrompt } from "@/lib/alfred/prompt";
import { adminDb } from "@/lib/firebaseAdmin";
import { vapi } from "@/lib/vapi";
import { NextResponse } from "next/server";

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
    const name = userData?.name?.split(" ")[0] || "there";
    console.log("Reminder Call Payload:", { payload, phoneNumber });

    if (!userId || !eventId || !eventType || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
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
        tools: [
          {
            type: "function",
            function: {
              name: "create_event",
              description:
                "Create a calendar event for the user when they mention meetings, classes, deadlines, or reminders with a time.",
              parameters: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  title: { type: "string" },
                  startTime: { type: "string", description: "ISO string" },
                  endTime: { type: "string", description: "ISO string" },
                  location: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["userId", "title", "startTime", "endTime"],
              },
            },
            server:{
              url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
            }
          },
          {
            type: "function",
            function: {
              name: "create_todo",
              description:
                "Create a todo/task for the user when they mention something to do, even if no exact time is given.",
              parameters: {
                type: "object",
                properties: {
                  userId: { type: "string" },
                  task: { type: "string" },
                  dueTime: { type: "string", description: "ISO string or null" },
                  priority: {
                    type: "string",
                    enum: ["low", "normal", "high"],
                  },
                },
                required: ["userId", "task"],
              },
            },
            server:{
              url: "https://poriferous-ean-unkept.ngrok-free.dev/api/vapi/webhook",
            }
          },
        ],
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
      firstMessage: `This is a call to remind you about your ${eventType} titled "${payload.title}".`,
      
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