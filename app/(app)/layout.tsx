"use client";

import React from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SignedIn, useUser } from "@clerk/nextjs";
import { redirect, usePathname } from "next/navigation";
import { ScheduleProvider } from "@/lib/context/ScheduleContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const pathname = usePathname(); // We might need this for some logic, or just to force re-render on route change if needed

  // Optional: Client-side protection (middleware is better, but this helps UX)
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      // redirect("/"); // Let Clerk middleware handle this or do it here
    }
  }, [isLoaded, isSignedIn]);

  return (
    <ScheduleProvider>
      <div className="flex min-h-screen bg-background">
        <SignedIn>
          <AppSidebar />
        </SignedIn>

        {/* Main Content Area */}
        <main className="flex-1 transition-all duration-300 md:ml-[60px] lg:ml-[240px] w-full">
          {children}
        </main>
      </div>
    </ScheduleProvider>
  );
}
