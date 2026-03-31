import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { buildAlfredSystemPrompt } from "@/lib/alfred/prompt";
import { getAlfredTools } from "@/lib/alfred/tools";

export async function POST(req: Request) {
  const body = await req.json();

  const { message } = body;

  if (message?.type !== "assistant-request") {
    return NextResponse.json({ success: false });
  }

  const call = message.call;
  const callerNumber = call.customer?.number;

  console.log("Inbound call from:", callerNumber);

  let name = "there";
  let userId = null;

  try {
    const userSnapshot = await adminDb
      .collection("users")
      .where("phoneNumber", "==", callerNumber)
      .limit(1)
      .get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      userId = userDoc.id;
      name = userData.fullName.split(" ")[0];

      console.log("Matched user:", name, userId);
    }
  } catch (err) {
    console.error("User lookup failed:", err);
  }
  if (!userId) {
    console.error("No user found for phone number:", callerNumber);
    return NextResponse.json({ success: false, error: "No user found for this phone number" }, { status: 404 });
  }
  const systemPrompt = await buildAlfredSystemPrompt({
    name,
    userId,
    callReason: "intro",
  });

  return NextResponse.json({
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

      firstMessage: `Hey ${name}, it’s Alfred. How can I help you today?`,
    },
  });
}
