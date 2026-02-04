import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const eventType = payload?.message?.type;

    console.log("VAPI WEBHOOK EVENT:", eventType);

    // 1) TOOL CALLS
    if (eventType === "tool-calls") {
      const toolCalls = payload?.message?.toolCalls || [];
      const results: any[] = [];

      // Loop through all tool calls
      for (const call of toolCalls) {
        const toolCallId = call?.id;
        const toolName = call?.function?.name;
        const rawArgs = call?.function?.arguments;
        const args = typeof rawArgs === "string" ? JSON.parse(rawArgs) : rawArgs;

        console.log("Tool call:", toolName, args);

        // Determine endpoint based on tool name
        let endpoint = "";
        if (toolName === "create_event") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/create-event";
        } else if (toolName === "create_todo") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/create-todo";
        } else if (toolName === "edit_event") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/edit-event";
        } else if (toolName === "complete_event") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/complete-event";
        } else if (toolName === "delete_event") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/delete-event";
        } else if (toolName === "edit_todo") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/edit-todo";
        } else if (toolName === "complete_todo") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/complete-todo";
        } else if (toolName === "delete_todo") {
          endpoint = "https://poriferous-ean-unkept.ngrok-free.dev/api/alfred/delete-todo";
        } else {
          console.warn("Unknown tool:", toolName);
          results.push({ toolCallId, error: "Unknown tool" });
          continue; // skip this call
        }

        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(args),
          });

          const data = await res.json();

          results.push({
            toolCallId,
            toolName,
            result: data,
          });
        } catch (err: any) {
          console.error("Error calling tool:", toolName, err);
          results.push({
            toolCallId,
            toolName,
            error: err.message,
          });
        }
      }

      return NextResponse.json({
        type: "tool-call-result",
        results,
      });
    }

    // 2) END OF CALL REPORT
    if (eventType === "end-of-call-report") {
      console.log("Call ended payload:", payload);
      // Here you can store transcript + summary if needed
      return NextResponse.json({ success: true });
    }

    // 3) Default fallback
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
