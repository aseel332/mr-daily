"use client";

import { useState, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import Vapi from "@vapi-ai/web";

type CallStatus = "idle" | "creating" | "connecting" | "connected" | "ended";

export function useVapiCall() {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [vapiInstance, setVapiInstance] = useState<Vapi | null>(null);

  const startWebCall = useCallback(async () => {
    if (!isSignedIn || !user) return;
    setCallStatus("creating");
    try {
      const token = await getToken();
      const res = await fetch("/api/vapi/web-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clerkId: user.id, name: user.fullName || "User" }),
      });
      if (!res.ok) throw new Error("Failed to start call");
      const data = await res.json();
      setCallStatus("connecting");

      const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

      vapi.on("call-start", () => {
        console.log("Call started");
        setCallStatus("connected");
      });

      vapi.on("call-end", () => {
        console.log("Call ended");
        setCallStatus("idle");
        setActiveCallId(null);
        setVapiInstance(null);
      });

      vapi.on("error", (error) => {
        console.error("Vapi error:", error);
        setCallStatus("idle");
        setActiveCallId(null);
        setVapiInstance(null);
      });

      setVapiInstance(vapi);

      const call = await vapi.start(data.assistant);
      if (call?.id) {
        setActiveCallId(call.id);
      }
    } catch (err) {
      console.error(err);
      setCallStatus("idle");
      alert("Failed to start call");
    }
  }, [isSignedIn, user, getToken]);

  const hangupCall = useCallback(async () => {
    if (vapiInstance) {
      try { vapiInstance.stop(); } catch (e) { console.error("Error stopping vapi:", e); }
    }

    if (activeCallId) {
      try {
        const token = await getToken();
        await fetch("/api/vapi/terminate-call", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ callId: activeCallId }),
        });
      } catch (e) {
        console.error("Error calling terminate-call API:", e);
      }
    }

    setCallStatus("idle");
    setActiveCallId(null);
    setVapiInstance(null);
  }, [vapiInstance, activeCallId, getToken]);

  return { callStatus, startWebCall, hangupCall, activeCallId };
}
