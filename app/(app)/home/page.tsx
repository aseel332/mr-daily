"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSchedule } from "@/lib/hooks/useSchedule";
import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { CalendarEvent } from "@/types/calendarTypes";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

// Components
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { NotionSchedule } from "@/components/home/NotionSchedule";
import { ChatWidget } from "@/components/home/ChatWidget";
import { CallModal } from "@/components/home/CallModal";

import { OnboardingModal } from "@/components/home/OnboardingModal";

// Hooks & Utils
import { useVapiCall } from "@/hooks/useVapiCall";
import {
  getTodayItems,
  normalizeScheduleItem,
} from "@/lib/utils/schedule";

export default function HomePage() {
  const router = useRouter();
  const { schedule, loading, reload } = useSchedule();
  const { user } = useUser();
  const { callStatus, startWebCall, hangupCall } = useVapiCall();
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("onboarding") === "true") {
        setShowOnboarding(true);
      }
    }
    setMounted(true);
  }, []);

  // Derived State
  const normalizedSchedule = useMemo<CalendarEvent[]>(
    () => schedule.map(normalizeScheduleItem),
    [schedule]
  );
  const todayItems = useMemo(() => getTodayItems(normalizedSchedule), [normalizedSchedule]);
  const userName = user?.firstName || "Friend";

  // Handlers (reuse logic)
  const { getToken } = useAuth();
  async function markComplete(item: CalendarEvent) {
    if (!user) return;
    try {
      const token = await getToken();
      const endpoint = item.type === "event" ? "/api/alfred/complete-event" : "/api/alfred/complete-todo";
      const idKey = item.type === "event" ? "eventId" : "todoId";
      const originalId = item.id.split("_")[0];
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, [idKey]: originalId }),
      });
      reload();
    } catch (err) { console.error(err); }
  }

  async function deleteItem(item: CalendarEvent) {
    if (!user) return;
    if (!confirm("Delete this item?")) return;
    try {
      const token = await getToken();
      const endpoint = item.type === "event" ? "/api/alfred/delete-event" : "/api/alfred/delete-todo";
      const idKey = item.type === "event" ? "eventId" : "todoId";
      const originalId = item.id.split("_")[0];
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, [idKey]: originalId }),
      });
      reload();
    } catch (err) { console.error(err); }
  }

  const handleCallToggle = () => {
    if (callStatus === "idle") startWebCall();
    else hangupCall();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto">
      <div className="w-full h-full">

        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            // Clear the onboarding query param from the URL
            const url = new URL(window.location.href);
            url.searchParams.delete("onboarding");
            router.replace(url.pathname + url.search);
          }}
        />

        <CallModal
          isOpen={callStatus !== "idle"}
          status={callStatus}
          onHangup={hangupCall}
          userName={user?.firstName || "You"}
        />

        {/* LEFT COLUMN: Greeting + Schedule */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <GreetingHeader
            userName={userName}
            onRefresh={reload}
            onCall={handleCallToggle}
            loading={loading}
            callStatus={callStatus}
          />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Today's Schedule
              <span className="text-sm font-normal text-muted-foreground ml-2 bg-muted px-2 py-0.5 rounded-full">
                {todayItems.length}
              </span>
            </h2>
            <NotionSchedule
              items={todayItems}
              onComplete={markComplete}
              onDelete={deleteItem}
              loading={loading}
            />
          </motion.div>

          {/* Mobile Chat Button */}
          <div className="lg:hidden mt-8">
            <Link href="/chat">
              <Button className="w-full h-12 rounded-xl text-lg shadow-md gap-2" variant="secondary">
                <MessageSquare size={20} />
                Chat with Alfred
              </Button>
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Widget (Desktop Only) */}
        {/* <div className="hidden lg:col-span-5 lg:flex flex-col h-[calc(100vh-80px)] sticky top-8">
          <ChatWidget className="h-full shadow-lg border-border/60 bg-background/50 backdrop-blur-xl" />
        </div> */}
      </div>
    </div>
  );
}
