"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone,
  CheckCircle,
  CalendarDays,
  Phone,
  Check,
  CreditCard,
  Tag,
  Sparkles,
  BadgeCheck,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REFERRAL_MAP: Record<string, string> = {
  ENG1080: "(530) 497 3906",
  ENG1081: "(530) 507 4907",
  ENG1082: "(530) 497 3886",
  ENG1083: "(530) 508 3378",
};
const REFERRAL_CODE_BASE = "ENG108";
const DEFAULT_AGENT_PHONE = "+1 (855) 555-0199";
const TOTAL_STEPS = 5;

// ─── Shared Google Calendar OAuth helper ──────────────────────────────────────
export async function connectGoogleCalendar(
  user: ReturnType<typeof useUser>["user"],
  router: ReturnType<typeof useRouter>,
  onClose: () => void
) {
  if (!user) return;
  try {
    const existingGoogle = user.externalAccounts.find((acc) =>
      acc.provider.includes("google")
    );
    if (existingGoogle) {
      onClose();
      return;
    }
    const externalAccount = await user.createExternalAccount({
      strategy: "oauth_google",
      redirectUrl: `${window.location.origin}/sso-callback`,
      additionalScopes: ["https://www.googleapis.com/auth/calendar"],
    });
    const redirectUrl =
      externalAccount.verification?.externalVerificationRedirectURL;
    if (redirectUrl) {
      window.location.href = redirectUrl.href;
    } else {
      throw new Error("No redirect URL returned from Clerk");
    }
  } catch (err) {
    console.error("[connectGoogleCalendar] OAuth error:", err);
    onClose();
    router.push("/settings?calendar=google");
  }
}

// ─── Card number formatter ────────────────────────────────────────────────────
function formatCardNumber(value: string) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  // Step 0 – phone
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  // Step 1 – plan / referral
  const [referralCode, setReferralCode] = useState("");
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralError, setReferralError] = useState(false);

  // Step 2 – card
  const [cardFirst, setCardFirst] = useState("");
  const [cardLast, setCardLast] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);

  const [selectedAgentPhone, setSelectedAgentPhone] = useState(DEFAULT_AGENT_PHONE);
  const [isFree, setIsFree] = useState(false);



  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingPhone(true);
    let formattedPhone = phone.replace(/[^\d]/g, "");
    if (!formattedPhone.startsWith("1")) formattedPhone = "1" + formattedPhone;
    formattedPhone = "+" + formattedPhone;
    try {
      const token = await getToken();
      await fetch("/api/save-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: formattedPhone, userId: user.id }),
      });
      setStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleApplyReferral = () => {
    const code = referralCode.trim().toUpperCase();
    if (REFERRAL_MAP[code]) {
      setReferralApplied(true);
      setReferralError(false);
      setSelectedAgentPhone(REFERRAL_MAP[code]);
      setIsFree(true);
    } else if (code === REFERRAL_CODE_BASE) {
      setReferralApplied(true);
      setReferralError(false);
      setSelectedAgentPhone(DEFAULT_AGENT_PHONE);
      setIsFree(true);
    } else {
      setReferralApplied(false);
      setReferralError(true);
      setIsFree(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    // Simulate processing
    await new Promise((r) => setTimeout(r, 1200));
    setProcessingPayment(false);
    setStep(3); // go to agent phone step
  };

  const cardValid =
    cardFirst.trim().length > 0 &&
    cardLast.trim().length > 0 &&
    cardNumber.replace(/\s/g, "").length === 16 &&
    /^\d{2}\/\d{2}$/.test(cardExpiry) &&
    cardCvv.length >= 3;

  const handleGoogleCalendarConnect = async () => {
    if (!user) return;
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
      connectGoogleCalendar(user, router, onClose);
    } catch (err) {
      console.error(err);
      connectGoogleCalendar(user, router, onClose);
    }
  };

  const handleSkipCalendar = async () => {
    if (!user) return onClose();
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
    } catch (err) {
      console.error(err);
    }
    onClose();
  };

  // ── Progress bar width ────────────────────────────────────────────────────
  // When referral is applied step 2 (card) is skipped, so we show 4 effective steps.
  const effectiveTotal = referralApplied ? TOTAL_STEPS - 1 : TOTAL_STEPS;
  // Map real step index to display step (referral skips index 2)
  const displayStep = referralApplied && step >= 3 ? step - 1 : step;
  const progressWidth = `${((displayStep + 1) / effectiveTotal) * 100}%`;

  // ── Back button helper ────────────────────────────────────────────────────
  const BackButton = ({ to }: { to: number }) => (
    <button
      type="button"
      onClick={() => setStep(to)}
      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-4 self-start"
    >
      <ArrowLeft className="w-3 h-3" /> Back
    </button>
  );

  // ── Common input className ─────────────────────────────────────────────────
  const inputCls =
    "w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-all text-sm";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open && step >= 4) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border">
        <DialogTitle className="sr-only">Alfred Onboarding</DialogTitle>
        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
            <motion.div
              className="h-full bg-neon-cyan"
              animate={{ width: progressWidth }}
              transition={{ duration: 0.35 }}
            />
          </div>

          {/* Step counter pill */}
          <div className="absolute top-4 right-4 text-[10px] font-medium text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">
            {displayStep + 1} / {effectiveTotal}
          </div>

          <AnimatePresence mode="wait">

            {/* ── STEP 0 – Phone Number ──────────────────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8 flex flex-col items-center text-center mt-4"
              >
                <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <Smartphone className="text-neon-cyan w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to Alfred!</h2>
                <p className="text-zinc-400 mb-8 text-sm">
                  Let&apos;s get started. Provide your phone number so your personal
                  AI agent can call you.
                </p>
                <form onSubmit={handleSavePhone} className="w-full">
                  <div className="flex flex-col gap-2 mb-6 text-left">
                    <label className="text-sm font-medium text-zinc-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      required
                      className={inputCls}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={savingPhone || !phone}
                    className="w-full bg-white text-black hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all font-semibold"
                  >
                    {savingPhone ? "Saving..." : "Continue"}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 1 – Choose Plan ───────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8 flex flex-col items-center text-center mt-4"
              >
                <BackButton to={0} />
                <div className="w-16 h-16 rounded-full bg-neon-cyan/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                  <Sparkles className="text-neon-cyan w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Choose Your Plan</h2>
                <p className="text-zinc-400 mb-6 text-sm">
                  Unlock your AI-powered daily assistant.
                </p>

                {/* Plan Card */}
                <div className="w-full rounded-2xl border-2 border-neon-cyan/50 bg-neon-cyan/5 p-5 mb-5 relative shadow-[0_0_20px_rgba(0,240,255,0.08)]">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-cyan text-black text-[10px] font-bold px-3 py-0.5 rounded-full tracking-wide">
                    MOST POPULAR
                  </div>
                  <p className="text-lg font-bold text-white mt-1">
                    Alfred Pro
                  </p>
                  <div className="flex items-baseline justify-center gap-1 my-2">
                    <span className="text-4xl font-extrabold text-neon-cyan">
                      {isFree ? "FREE" : referralApplied ? "$9" : "$10"}
                    </span>
                    {!isFree && <span className="text-zinc-400 text-sm">/ month</span>}
                  </div>
                  {referralApplied && (
                    <p className="text-xs text-green-400 mb-1">
                      {isFree ? "Full referral access applied! 🎁" : "Referral discount applied 🎉"}
                    </p>
                  )}
                  <ul className="text-xs text-zinc-400 space-y-1 mt-3 text-left">
                    {[
                      "Daily AI reminder calls",
                      "Smart calendar sync",
                      "Task & event management",
                      "24/7 voice assistant access",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-neon-cyan shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Referral Code */}
                <div className="w-full mb-5">
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block text-left flex items-center gap-1.5">
                    <Tag className="w-3 h-3" /> Referral Code (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => {
                        setReferralCode(e.target.value);
                        setReferralError(false);
                        if (referralApplied) setReferralApplied(false);
                      }}
                      placeholder="Enter code"
                      className={`${inputCls} uppercase tracking-widest`}
                    />
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      disabled={!referralCode.trim()}
                      className="shrink-0 px-4 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                  {referralApplied && (
                    <p className="text-xs text-green-400 mt-1.5 flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3" />
                      {isFree ? "Free special access unlocked!" : "Code applied — $1 off your first month!"}
                    </p>
                  )}
                  {referralError && (
                    <p className="text-xs text-red-400 mt-1.5">
                      Invalid referral code. Try again.
                    </p>
                  )}
                </div>

                <Button
                  onClick={() => setStep(referralApplied ? 3 : 2)}
                  className="w-full bg-white text-black hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all font-semibold"
                >
                  {referralApplied ? "Activate Subscription" : "Continue to Payment"}
                </Button>
              </motion.div>
            )}

            {/* ── STEP 2 – Card Details ──────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8 flex flex-col items-center text-center mt-4"
              >
                <BackButton to={1} />
                <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                  <CreditCard className="text-violet-400 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-1">Payment Details</h2>
                <p className="text-zinc-400 mb-6 text-sm">
                  Your card is encrypted and never stored on our servers.
                </p>

                <form onSubmit={handlePayment} className="w-full space-y-3 text-left">
                  {/* Name row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={cardFirst}
                        onChange={(e) => setCardFirst(e.target.value)}
                        placeholder="Jane"
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={cardLast}
                        onChange={(e) => setCardLast(e.target.value)}
                        placeholder="Doe"
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Card number */}
                  <div>
                    <label className="text-xs text-zinc-400 mb-1 block">
                      Card Number
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      placeholder="1234 5678 9012 3456"
                      required
                      className={inputCls + " tracking-wider font-mono"}
                    />
                  </div>

                  {/* Expiry + CVV row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardExpiry}
                        onChange={(e) =>
                          setCardExpiry(formatExpiry(e.target.value))
                        }
                        placeholder="12/27"
                        required
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 mb-1 block">
                        CVV
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={cardCvv}
                        onChange={(e) =>
                          setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                        }
                        placeholder="123"
                        required
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Price reminder */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-3 flex items-center justify-between text-xs text-zinc-400 mt-1">
                    <span>
                      Alfred Pro —{" "}
                      {referralApplied ? (
                        <>
                          <s className="text-zinc-600">$10</s>{" "}
                          <span className="text-green-400 font-semibold">$9</span>
                        </>
                      ) : (
                        <span className="text-white font-semibold">$10</span>
                      )}{" "}
                      / month
                    </span>
                    <span className="text-zinc-500">Billed monthly</span>
                  </div>

                  <Button
                    type="submit"
                    disabled={processingPayment || !cardValid}
                    className="w-full bg-white text-black hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all font-semibold mt-2"
                  >
                    {processingPayment ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      `Subscribe — ${referralApplied ? "$9" : "$10"}/mo`
                    )}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* ── STEP 3 – Agent Phone Number ────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8 flex flex-col items-center text-center mt-4"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                  <CheckCircle className="text-green-400 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You&apos;re all set! 🎉</h2>
                <p className="text-zinc-400 mb-8 text-sm">
                  Subscription active. Here is your Agent&apos;s phone number —
                  save it so you know it&apos;s Alfred calling.
                </p>

                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-center gap-3 w-full mb-8">
                  <Phone className="text-neon-cyan w-5 h-5" />
                  <span className="text-xl font-semibold tracking-wider text-white">
                    {selectedAgentPhone}
                  </span>
                </div>

                <Button
                  onClick={() => setStep(4)}
                  className="w-full bg-white text-black hover:bg-neon-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all font-semibold"
                >
                  <Check className="mr-2 w-4 h-4" /> I saved it, Continue
                </Button>
              </motion.div>
            )}

            {/* ── STEP 4 – Google Calendar ───────────────────────────────── */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="p-8 flex flex-col items-center text-center mt-4"
              >
                <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                  <CalendarDays className="text-indigo-400 w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Sync Google Calendar</h2>
                <p className="text-zinc-400 mb-8 text-sm">
                  Would you like Alfred to automatically sync your schedule and
                  tasks with your Google Calendar?
                </p>

                <div className="flex flex-col gap-3 w-full mb-4">
                  <button
                    onClick={handleGoogleCalendarConnect}
                    className="p-4 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10 transition-all flex items-center justify-center group gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                    <span className="font-semibold text-neon-cyan">
                      Connect &amp; Enable Sync
                    </span>
                  </button>

                  <Button
                    variant="ghost"
                    className="w-full text-zinc-500 hover:text-white"
                    onClick={handleSkipCalendar}
                  >
                    Not now, Skip
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
