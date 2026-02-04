"use client";

import { useState } from "react";
import Vapi from "@vapi-ai/web";
import { useAuth } from "@clerk/nextjs";

export default function WebCallButton() {
  const [callActive, setCallActive] = useState(false);
  const { getToken, } = useAuth();
  // getting user from clerk auth
 



  const startCall = async () => {
    const res = await fetch("/api/vapi/web-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json",
        'Authorization': `Bearer ${await getToken()}`,
       },
      body: JSON.stringify({
        clerkId: "user_38YOt3jr8pX2ZYaQtANtb7sqTtU",
        name: "Aseel Lakadia",
      }),
    });

    const data = await res.json();

    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

    vapi.on("call-start", () => setCallActive(true));
    vapi.on("call-end", () => setCallActive(false));

    await vapi.start(data.assistant);
  };

  const stopCall = async () => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    await vapi.stop();
    setCallActive(false);
  };

  return (
    <div className="flex gap-3">
      {!callActive ? (
        <button
          onClick={startCall}
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          Start Alfred Call
        </button>
      ) : (
        <button
          onClick={stopCall}
          className="px-4 py-2 rounded-xl bg-red-600 text-white"
        >
          End Call
        </button>
      )}
    </div>
  );
}