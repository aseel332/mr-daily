// app/settings/page.tsx
"use client";

import React, { useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import {
  Settings as SettingsIcon,
  CreditCard,
  CalendarDays,
  Unlink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { NeonContainer } from "@/components/home/NeonContainer";
import { connectGoogleCalendar } from "@/components/home/OnboardingModal";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const googleEnabled = (user?.unsafeMetadata as any)?.googleCalendarSyncEnabled === true;
  const [calendarEnabled, setCalendarEnabled] = useState(googleEnabled);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Subscription info (static for now)
  const subscriptionPlan = "Alfred Pro";
  const subscriptionPrice = "$10 / month";
  const subscriptionStatus = "Active";
  const renewalDate = "April 3, 2026";

  const handleDisconnectCalendar = async () => {
    if (!user) return;
    setDisconnecting(true);
    try {
      const token = await getToken();
      await fetch("/api/update-user-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          googleCalendarSyncEnabled: false,
        }),
      });
      await user.reload();
      setCalendarEnabled(false);
    } catch (err) {
      console.error(err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleConnectCalendar = async () => {
    if (!user) return;
    setConnecting(true);
    try {
      const token = await getToken();
      await fetch("/api/update-user-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          googleCalendarSyncEnabled: true,
        }),
      });
      setCalendarEnabled(true);
      await connectGoogleCalendar(user, router, () => { });
    } catch (err) {
      console.error(err);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 lg:max-w-2xl lg:mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center gap-3"
      >
        <SettingsIcon size={24} className="text-neon-cyan" />
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
      </motion.div>

      {/* ── Subscription ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <NeonContainer title="Subscription" icon={CreditCard} accent="cyan">
          <div className="space-y-4">
            {/* Plan + status */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-200">
                  {subscriptionPlan}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{subscriptionPrice}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" />
                {subscriptionStatus}
              </span>
            </div>

            {/* Renewal */}
            <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-white/[0.06] pt-3">
              <span>Next renewal</span>
              <span className="text-zinc-400">{renewalDate}</span>
            </div>

            {/* Manage button */}
            <button
              disabled
              title="Billing management coming soon"
              className="w-full mt-1 py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] text-zinc-600 text-xs font-medium cursor-not-allowed"
            >
              Manage Subscription (coming soon)
            </button>
          </div>
        </NeonContainer>
      </motion.div>

      {/* ── Google Calendar ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6"
      >
        <NeonContainer title="Google Calendar" icon={CalendarDays} accent="violet">
          <div className="space-y-4">
            {/* Status row */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                {calendarEnabled
                  ? "Alfred is syncing with your Google Calendar."
                  : "Connect Google Calendar to sync your schedule and tasks."}
              </p>
              {calendarEnabled ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20 px-3 py-1 rounded-full shrink-0 ml-3">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full shrink-0 ml-3">
                  <AlertCircle className="w-3 h-3" />
                  Not linked
                </span>
              )}
            </div>

            {/* Action button */}
            {calendarEnabled ? (
              <button
                onClick={handleDisconnectCalendar}
                disabled={disconnecting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Unlink className="w-4 h-4" />
                {disconnecting ? "Disconnecting…" : "Disconnect Google Calendar"}
              </button>
            ) : (
              <button
                onClick={handleConnectCalendar}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10 text-neon-cyan text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </div>
                {connecting ? "Connecting…" : "Connect Google Calendar"}
              </button>
            )}
          </div>
        </NeonContainer>
      </motion.div>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <NeonContainer title="About" icon={SettingsIcon} accent="violet">
          <div className="space-y-3 text-xs text-zinc-500">
            <div className="flex justify-between">
              <span>Version</span>
              <span className="text-zinc-400">2.0</span>
            </div>
            <div className="flex justify-between">
              <span>Theme</span>
              <span className="text-neon-cyan">Dark Neon</span>
            </div>
            <div className="flex justify-between">
              <span>Assistant</span>
              <span className="text-zinc-400">Alfred AI</span>
            </div>
          </div>
        </NeonContainer>
      </motion.div>
    </div>
  );
}