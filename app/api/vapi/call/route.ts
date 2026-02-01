import { NextResponse } from "next/server";
import { buildAlfredSystemPrompt } from "@/lib/alfred/prompt";
import { vapi } from "@/lib/vapi";
import { auth } from "@clerk/nextjs/server";
import { getUserCalendarEvents } from "@/lib/alfred/calendarService";
import { formatEventsForAgent } from "@/lib/alfred/calendarFormatter";

export async function POST(req: Request) {
  const body = await req.json();
  console.log(body);
  const userContext = {
    userId: body.clerkId,
    name: body.name.split(" ")[0],
    phoneNumber: body.phoneNumber,
    callReason: "intro" as const,
  };


  console.log(body.userId)
  const systemPrompt = await buildAlfredSystemPrompt({
    name: userContext.name,
    userId: body.clerkId,
    callReason: userContext.callReason,
  });

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
      firstMessage: `Hey ${userContext.name}, it’s Alfred. How can I help you today?`,
      
    },
    
  });

  return Response.json({ success: true, callId: call });
}
