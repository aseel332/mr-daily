// app/api/vapi/web-assistant/route.ts
import { NextResponse } from "next/server";
import { buildAlfredSystemPrompt } from "@/lib/alfred/prompt";
import { getAlfredTools } from "@/lib/alfred/tools";

export async function POST(req: Request) {
  const body = await req.json();

  const userContext = {
    userId: body.clerkId || body.userId,
    name: (body.name || "there").split(" ")[0],
    callReason: "intro" as const,
  };

  const systemPrompt = await buildAlfredSystemPrompt({
    name: userContext.name,
    userId: userContext.userId,
    callReason: userContext.callReason,
  });

  return NextResponse.json({
    success: true,
    assistant: {
      model: {
        provider: "openai",
        model: "gpt-4o",
        temperature: 0.5,
        messages: [{ role: "system", content: systemPrompt }],
        tools: getAlfredTools() as any,
      },

      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },

      firstMessage: `Hey ${userContext.name}, it’s Alfred. How can I help you today?`,
    },
  });
}

