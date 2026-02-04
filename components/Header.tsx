// components/Header.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useUser, UserButton } from "@clerk/nextjs";
import { Phone, RefreshCw } from "lucide-react";

type Props = {
  onRefresh?: () => void;
  onCall?: () => void;
  calling?: boolean;
};

export default function Header({ onRefresh, onCall, calling }: Props) {
  const { user } = useUser();

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full  text-white w-12 h-12 flex items-center justify-center font-semibold">
         <UserButton/>
        </div>
        <div>
          <div className="text-sm text-slate-500">Good {new Date().getHours() < 12 ? "morning" : "evening"},</div>
          <div className="font-bold text-lg">{user?.firstName || user?.fullName || "Friend"}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onRefresh} className="flex items-center gap-2">
          <RefreshCw size={16} /> Refresh
        </Button>
        <Button onClick={onCall} className="bg-black text-white flex items-center gap-2">
          <Phone size={16} /> {calling ? "Calling…" : "Call"}
        </Button>
      </div>
    </header>
  );
}
