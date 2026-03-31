import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { callId } = await req.json();

    if (!callId) {
      return NextResponse.json({ success: false, error: "Missing callId" }, { status: 400 });
    }

    console.log(`Terminating call: ${callId}`);

    const res = await fetch(`https://api.vapi.ai/call/${callId}/terminate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Vapi terminate error:", errorData);
      throw new Error("Failed to terminate call via Vapi API");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Terminate call error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
