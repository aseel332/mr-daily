// app/home/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import Header from "@/components/Header";
import CalendarMini from "@/components/CalendarMini";
import EventCard from "@/components/EventCard";
import TodoList from "@/components/TodoList";
import PhoneModal from "@/components/PhoneModal";
import CallButton from "@/components/CallButton";
import { useSchedule } from "@/lib/hooks/useSchedule";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { CalendarEvent } from "@/types/calendarTypes";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Vapi from "@vapi-ai/web";

/**
 * Home page — fixed and upgraded:
 *  - selectedDateKey stores UTC yyyy-mm-dd (avoids timezone mismatch)
 *  - mini calendar click sets selectedDateKey reliably
 *  - events are shown in main; todos are in right column (still filtered by selected day)
 *  - Call modal that uses a server endpoint to create a Vapi web call session
 */

export default function HomePage() {
  const { schedule, updatedAt, loading, reload } = useSchedule();
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // store **UTC yyyy-mm-dd** key to match eventsByDay keys (generated on server as UTC)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);
  const [calling, setCalling] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);

  // Call modal state
  const [showCallModal, setShowCallModal] = useState(false);
  const [callSession, setCallSession] = useState<any | null>(null); // session returned from server
  const [callStatus, setCallStatus] = useState<"idle" | "creating" | "connecting" | "connected" | "ended">("idle");

  // normalize schedule: todos may use `task` — ensure .title exists
  const normalizedSchedule = useMemo<CalendarEvent[]>(
    () =>
      schedule.map((s) => {
        const anyS = s as any;
        const title = s.title ?? anyS.task ?? "Untitled";
        const deadline = s.deadline ?? anyS.dueTime ?? null;
        return {
          ...s,
          title,
          deadline,
        } as CalendarEvent;
      }),
    [schedule]
  );

  // build eventsByDay keyed by UTC yyyy-mm-dd
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    normalizedSchedule.forEach((ev) => {
      const dt = ev.startTime ?? ev.deadline ?? null;
      if (!dt) return;
      const d = new Date(dt);
      if (isNaN(d.getTime())) return;
      // convert local date to a UTC-key: yyyy-mm-dd (UTC)
      const key = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    });
    return map;
  }, [normalizedSchedule]);

  // compute visible items (either selected day or upcoming)
  const visibleItems = useMemo(() => {
    if (!selectedDateKey) {
      const now = Date.now();
      return normalizedSchedule
        .slice()
        .filter((s) => {
          const t = s.startTime || s.deadline;
          return t ? new Date(t).getTime() >= now - 1000 * 60 * 60 * 24 : true;
        })
        .sort((a, b) => {
          const at = a.startTime || a.deadline;
          const bt = b.startTime || b.deadline;
          const aTs = at ? new Date(at).getTime() : Infinity;
          const bTs = bt ? new Date(bt).getTime() : Infinity;
          return aTs - bTs;
        })
        .slice(0, 50);
    } else {
      return (eventsByDay.get(selectedDateKey) || []).slice().sort((a, b) => {
        const at = a.startTime || a.deadline;
        const bt = b.startTime || b.deadline;
        const aTs = at ? new Date(at).getTime() : Infinity;
        const bTs = bt ? new Date(bt).getTime() : Infinity;
        return aTs - bTs;
      });
    }
  }, [normalizedSchedule, selectedDateKey, eventsByDay]);

  // helper to convert a local Date (from CalendarMini) into UTC key
  function localDateToUTCKey(d: Date) {
    // produce a date at UTC midnight for that local calendar day
    const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    return utc.toISOString().slice(0, 10);
  }

  // ---------------- Call flow: open modal -> create session on server -> show UI -----------
  async function openCallModal() {
    if (!isSignedIn || !user) {
      router.push("/sign-in");
      return;
    }
    setShowCallModal(true);
  }

  async function startWebCall() {
    if (!isSignedIn || !user) {
      router.push("/sign-in");
      return;
    }
   

    setCallStatus("creating");
    try {
      // call your server to create a Vapi web-call session
      // server uses VAPI key and returns { callId, sessionToken, websocketUrl, connectUrl } per server implementation
      const token = await getToken();
      const res = await fetch("/api/vapi/web-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          clerkId: user.id,
          name: user.fullName || user.firstName || "User",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error("web-assistant call failed", err);
        alert("Failed to create call. See console.");
        setCallStatus("idle");
        return;
      }

      const data = await res.json();

      setCallSession(data);
      setCallStatus("connecting");

        const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
        vapi.on("call-start", () => setCallStatus("connected"));
        vapi.on("call-end", () => {
          setCallStatus("ended");
          setShowCallModal(false);
          setCallSession(null);
        });
        await vapi.start(data.assistant);
      
     
    } catch (err) {
      console.error("startWebCall err", err);
      alert("Could not start call.");
      setCallStatus("idle");
    }
  }

  async function hangupCall() {
    setCallStatus("ended");
    if (!callSession?.callId) {
      setShowCallModal(false);
      setCallSession(null);
      return;
    }

    try {
      const token = await getToken();
      await fetch("/api/vapi/terminate-call", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ callId: callSession.callId }),
      });
    } catch (err) {
      console.error("hangup error", err);
    } finally {
      setShowCallModal(false);
      setCallSession(null);
      setCallStatus("idle");
    }
  }

  // ---------------- phone save ----------------
  async function onSavePhone(raw: string) {
    setSavingPhone(true);
    try {
      let normalized = raw.replace(/[^\d+]/g, "");
      if (!normalized.startsWith("+")) {
        normalized = normalized.replace(/^1/, "");
        normalized = "+1" + normalized;
      }
      const token = await getToken();
      const r = await fetch("/api/save-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: normalized, userId: user!.id }),
      });
      if (!r.ok) throw new Error("save failed");
      setPhone(normalized);
      setShowPhoneModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save phone.");
    } finally {
      setSavingPhone(false);
    }
  }

  // ---------------- complete / delete ----------------
  async function markComplete(item: CalendarEvent) {
    if (!user) return;
    try {
      const token = await getToken();
      if (item.type === "event") {
        await fetch("/api/alfred/complete-event", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: user.id, eventId: item.id }),
        });
      } else {
        await fetch("/api/alfred/complete-todo", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: user.id, todoId: item.id }),
        });
      }
      reload();
    } catch (err) {
      console.error("complete error", err);
      alert("Failed to mark complete.");
    }
  }

  async function deleteItem(item: CalendarEvent) {
    if (!user) return;
    if (!confirm("Delete this item?")) return;
    try {
      const token = await getToken();
      if (item.type === "event") {
        await fetch("/api/alfred/delete-event", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: user.id, eventId: item.id }),
        });
      } else {
        await fetch("/api/alfred/delete-todo", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId: user.id, todoId: item.id }),
        });
      }
      reload();
    } catch (err) {
      console.error("delete error", err);
      alert("Failed to delete.");
    }
  }

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Header onRefresh={reload} onCall={openCallModal} calling={calling} />
        </div>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-2">
        {/* LEFT */}
        <aside className="md:col-span-4 space-y-4">
          <CalendarMini
            eventsByDay={eventsByDay}
            calendarMonth={calendarMonth}
            setCalendarMonth={setCalendarMonth}
            onSelectDay={(d) => {
              if (!d) {
                setSelectedDateKey(null);
              } else {
                setSelectedDateKey(localDateToUTCKey(d));
              }
            }}
          />

          <div className="flex justify-center">
            <Button variant={"outline"} onClick={() => router.push("/calendar")}>
              Open Full Calendar
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Upcoming</div>
              <div className="text-xs text-slate-500">{updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : ""}</div>
            </div>

            {loading ? (
              <div className="py-6 flex justify-center">
                <div className="h-8 w-8 rounded-full border-4 border-black border-t-transparent animate-spin" />
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="text-sm text-slate-500">No upcoming events or todos.</div>
            ) : (
              <ul className="space-y-3">
                {visibleItems.slice(0, 6).map((it) => (
                  <li key={it.id} className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 mt-1 rounded-full bg-indigo-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{it.title}</div>
                      <div className="text-xs text-slate-500">
                        {it.startTime
                          ? new Date(it.startTime).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                          : it.deadline
                          ? new Date(it.deadline).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                          : "No time"}
                        {it.location ? ` • ${it.location}` : ""}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* MAIN: show events only */}
        <main className="md:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Schedule</h2>
            <div className="text-sm text-slate-500">{selectedDateKey ? new Date(selectedDateKey + "T00:00:00Z").toLocaleDateString() : "Next items"}</div>
          </div>

          <div className="space-y-4">
            {visibleItems.filter(i => i.type === "event").length === 0 && !loading ? (
              <div className="rounded-xl bg-white p-6 text-center text-slate-500">No events for this period.</div>
            ) : (
              visibleItems.filter(i => i.type === "event").map((it) => (
                <EventCard key={it.id} it={it} onComplete={() => markComplete(it)} onDelete={() => deleteItem(it)} />
              ))
            )}
          </div>
        </main>

        {/* RIGHT: todos */}
        <aside className="md:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">To-dos</div>
              <div className="text-xs text-slate-500">{normalizedSchedule.filter((s) => s.type === "todo").length}</div>
            </div>

            <TodoList
              todos={normalizedSchedule.filter((s) => s.type === "todo" && (!selectedDateKey || (eventsByDay.get(selectedDateKey) || []).some(x => x.id === s.id)))}
              onComplete={(t) => markComplete(t)}
              onDelete={(t) => deleteItem(t)}
            />

            <div className="mt-4">
              <Button onClick={() => router.push("/create")} className="w-full flex items-center justify-center gap-2">
                <Plus size={16} /> New
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-sm font-medium mb-2">Quick tips</div>
            <div className="text-xs text-slate-500">
              • Tap a day on the mini calendar to filter. <br />
              • Click "Open Full Calendar" to view a larger calendar. <br />
              • Use Call to start a voice session.
            </div>
          </div>
        </aside>
      </div>

      {/* Phone modal */}
      <PhoneModal open={showPhoneModal} onClose={() => setShowPhoneModal(false)} onSave={onSavePhone} />

      {/* Call modal */}
      {showCallModal && (
        <CallModal
          open={showCallModal}
          onClose={() => { setShowCallModal(false); setCallSession(null); setCallStatus("idle"); }}
          callStatus={callStatus}
          onStart={startWebCall}
          onHangup={hangupCall}
          session={callSession}
        />
      )}
    </div>
  );
}

/**
 * CallModal: nice, polished modal with animated waveform and connect status.
 * - onStart triggers the server endpoint to create the web-call session
 * - onHangup tells server to end the call
 *
 * NOTE: client-side connection/streaming (real RTC) depends on Vapi's SDK or returned websocket URL.
 * Server endpoint should create the call using Vapi API and return session info the client can use.
 */
function CallModal({ open, onClose, callStatus, onStart, onHangup, session }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Call with Alfred</h3>
            <p className="text-sm text-slate-500 mt-1">Voice assistant session — you can speak naturally. Microphone will be used if required.</p>
          </div>
          <div>
            <button onClick={onClose} className="text-sm text-slate-500">Close</button>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          {/* connection status */}
          <div className="text-sm text-slate-600">Status: <strong className="ml-1">{callStatus}</strong></div>

          {/* waveform / mic visualization */}
          <div className="w-full max-w-xl">
            <Waveform connected={callStatus === "connected"} />
          </div>

          {/* controls */}
          <div className="flex items-center gap-3">
            {callStatus === "idle" && <Button onClick={onStart}>Start Call</Button>}
            {callStatus === "creating" && <Button disabled>Creating…</Button>}
            {callStatus === "connecting" && <Button disabled>Connecting…</Button>}
            {callStatus === "connected" && <Button onClick={onHangup} className="bg-red-600 text-white">Hang Up</Button>}
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>

          {/* session details */}
          {session?.callId && <div className="text-xs text-slate-500">Call ID: {session.callId}</div>}
        </div>
      </div>
    </div>
  );
}

/** Waveform — purely CSS animated bars that pulse when connected.
 * Replace with real audio-level visualization when you have the audio stream.
 */
function Waveform({ connected }: { connected: boolean }) {
  return (
    <div className="w-full h-24 flex items-end justify-center gap-2">
      {Array.from({ length: 26 }).map((_, i) => (
        <div
          key={i}
          className={`bg-indigo-500 rounded-sm w-1 ${connected ? `animate-wave delay-${i}` : "opacity-30"}`}
          style={{ height: `${10 + (i % 6) * 6}px` }}
        />
      ))}

      <style jsx>{`
        .animate-wave {
          animation: wave 900ms ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes wave {
          0% { transform: scaleY(1); opacity: 0.6; }
          50% { transform: scaleY(1.8); opacity: 1; }
          100% { transform: scaleY(1); opacity: 0.6; }
        }
        /* simple stagger classes */
        ${Array.from({ length: 26 }).map((_, i) => {
          return `.delay-${i} { animation-delay: ${i * 40}ms; }`;
        }).join("\n")}
      `}</style>
    </div>
  );
}
