import { NextResponse } from "next/server";
import { vapi } from "@/lib/vapi";

export async function POST(req: Request) {
  const body = await req.json();

  // Hardcoded reminder context
  const userContext = {
    userId: body.clerkId,
    name: "Aseel",
    phoneNumber: body.phoneNumber,
    callReason: "reminder" as const,
  };

  // Hardcoded system prompt for reminder call
  const systemPrompt = `
You are Alfred, a calm, reliable, human-like AI voice assistant.

This is a reminder call.
Do NOT ask questions.
Do NOT gather information.
Do NOT create or edit events or todos.
Do NOT use any tools.

Your only job is to deliver the reminder clearly and naturally.

Message to deliver:
"Hey Aseel, this is Alfred. Just a quick reminder to start working on your meeting video in about 10 minutes.
After that, you have your ECS 132 class at 4 PM.
You’ve got this. I’ll let you get to it."

Speak confidently, friendly, and brief.
`;

  const call = await vapi.calls.create({
    phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID!,
    customer: {
      number: userContext.phoneNumber,
      name: userContext.name,
    },
    assistant: {
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.3,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
        ],
      },
      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },
      firstMessage:
        "Hey Aseel, this is Alfred. Just a quick reminder to start working on your meeting video in about 10 minutes. After that, you have your ECS 132 class at 4 PM.",
    },
  });

  return NextResponse.json({
    success: true,
  });
}
