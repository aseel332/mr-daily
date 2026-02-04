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

      if (response.status === 201) {
        setNeedPhone(true);
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
          <div className="h-10 w-10 rounded-full border-4 border-black border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">
            Setting things up…
          </p>
        </div>
      );
    }

    // PHONE COLLECTION SCREEN
    if (needPhone) {
      return (
        <>
          <header className="bg-black flex justify-between items-center p-4 h-16">
            <span className="font-bold text-lg">Alfred</span>
            <UserButton />
          </header>

          <main>
            <div className="flex flex-col items-center justify-center p-10">
              <h1 className="text-4xl font-bold mb-2">Almost there!</h1>
              <p className="text-lg mb-6">
                Please provide your phone number to enable call features.
              </p>

              <form
                className="flex flex-col gap-4 w-64"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSavingPhone(true);

                  const formData = new FormData(e.currentTarget);
                  let phone = String(formData.get("phoneNumber") || "");

                  // Remove spaces, dashes, parentheses
                  phone = phone.replace(/[^\d]/g, "");

                  // Prefix +1 if not already included
                  if (!phone.startsWith("1")) {
                    phone = "1" + phone;
                  }

                  phone = "+" + phone;

                  const response = await fetch("/api/save-phone", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${await getToken()}`,
                    },
                    body: JSON.stringify({
                      phoneNumber: phone,
                      userId: user.id,
                    }),
                  });

                  setSavingPhone(false);

                  if (response.ok) {
                    router.push("/home");
                  }
                }}
              >
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="5551234567"
                  required
                  className="p-2 border rounded"
                />

                <Button
                  type="submit"
                  disabled={savingPhone}
                >
                  {savingPhone ? "Saving…" : "Submit"}
                </Button>
              </form>
            </div>
          </main>
        </>
      );
    }

    return null;
  }

  // -----------------------------
  // SIGNED OUT LANDING PAGE
  // -----------------------------
  return (
    <>
      <header className="bg-black flex justify-between items-center p-4 h-16">
        <span className="font-bold text-lg">Alfred</span>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main>
        <div className="flex flex-col items-center justify-center p-20">
          <h1 className="text-4xl font-bold mb-2">Introducing Alfred</h1>
          <p className="text-lg">Your personal AI agent for everything</p>
        </div>
      </main>
    </>
  );
}
