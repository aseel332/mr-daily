// components/CallButton.tsx
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

type Props = {
  onCall: () => void;
  calling?: boolean;
};

export default function CallButton({ onCall, calling }: Props) {
  return (
    <Button onClick={onCall} className="bg-black text-white flex items-center gap-2">
      <Phone /> {calling ? "Calling…" : "Call"}
    </Button>
  );
}
