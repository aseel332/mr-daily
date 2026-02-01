import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload?.type;

    console.log("VAPI WEBHOOK EVENT:", eventType);

    // 1) TOOL CALLS
    if (eventType === "tool-call") {
      const toolCallId = payload?.toolCall?.id;
      const toolName = payload?.toolCall?.function?.name;

      const rawArgs = payload?.toolCall?.function?.arguments;
      const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;

      console.log("Tool call:", toolName, args);

      if (toolName === "create_event") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/alfred/create-event`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args),
          }
        );

        const data = await res.json();

        return NextResponse.json({
          type: "tool-call-result",
          toolCallId,
          result: data,
        });
      }

      if (toolName === "create_todo") {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/alfred/create-todo`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args),
          }
        );

        const data = await res.json();

        return NextResponse.json({
          type: "tool-call-result",
          toolCallId,
          result: data,
        });
      }

      return NextResponse.json({
        type: "tool-call-result",
        toolCallId,
        result: { success: false, error: "Unknown tool" },
      });
    }

    // 2) END OF CALL REPORT
    if (eventType === "end-of-call-report") {
      console.log("Call ended payload:", payload);

      // Here you can store transcript + summary
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}