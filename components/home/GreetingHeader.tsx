"use client";

import React from "react";
import { RefreshCw, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GreetingHeaderProps {
  userName: string;
  onRefresh: () => void;
  onCall: () => void;
  loading: boolean;
  callStatus: "idle" | "creating" | "connecting" | "connected" | "ended";
}

export function GreetingHeader({
  userName,
  onRefresh,
  onCall,
  loading,
  callStatus,
}: GreetingHeaderProps) {
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight">
          <span className="">
            {getGreeting()}, {userName}
          </span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Here's what's on your plate today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-full w-10 h-10 border-border hover:bg-accent hover:text-accent-foreground transition-all"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>

        <Button
          onClick={onCall}
          disabled={callStatus !== "idle"}
          className={cn(
            "rounded-full px-6 font-semibold shadow-lg transition-all",
            callStatus === "connected"
              ? "bg-destructive hover:bg-destructive/90 text-white animate-pulse"
              : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-105"
          )}
        >
          <Phone className="h-4 w-4 mr-2" />
          {callStatus === "idle" ? "Call Alfred" :
            callStatus === "connected" ? "End Call" : "Calling..."}
        </Button>
      </div>
    </div>
  );
}
