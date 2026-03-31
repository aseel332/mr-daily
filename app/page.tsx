"use client";

import { useUser, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Home() {
  const [isCreated, setIsCreated] = useState(false);
  const [needPhone, setNeedPhone] = useState(false);
  const [checkedSync, setCheckedSync] = useState(false);

  const [pending, startTransition] = useTransition();
  const [savingPhone, setSavingPhone] = useState(false);

  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  // -----------------------------
  // SYNC USER ON LOGIN
  // -----------------------------
  useEffect(() => {
    if (!isSignedIn || !user || checkedSync) return;

    startTransition(async () => {
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          fullName: user.fullName || "",
        }),
      });

      const data = await response.json();
      if (data.needsPhone) {
        router.push("/home?onboarding=true");
      } else {
        router.push("/home");
      }

      setIsCreated(true);
      setCheckedSync(true);
    });
  }, [isSignedIn, user, checkedSync]);

  // -----------------------------

  // SIGNED IN FLOW
  if (isSignedIn && user) {
    // Show loading while syncing
    if (!checkedSync || pending) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-6">
          <div className="h-10 w-10 rounded-full border-4 border-black border-t-transparent animate-spin dark:border-white dark:border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Setting things up…
          </p>
        </div>
      );
    }

    return null;
  }

  // -----------------------------
  // SIGNED OUT LANDING PAGE
  // -----------------------------
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-bold text-xl dark:bg-white dark:text-black">
            A
          </div>
          <span className="font-bold text-xl tracking-tight">Alfred</span>
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="font-semibold">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="font-semibold rounded-full px-6">Get Started</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="pt-16">
        <LandingPage />
      </main>
    </>
  );
}
