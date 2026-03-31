"use client";

import React, { useState, useEffect } from "react";
import { ChatWidget } from "@/components/home/ChatWidget";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link"; // Changed to Next Link for better routing

export default function ChatPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex flex-col bg-background">
      <header className="flex items-center gap-2 p-4 border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10 md:hidden">
        <Link href="/home">
          <Button variant="ghost" size="icon" className="-ml-2">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <h1 className="font-semibold text-lg">Chat</h1>
      </header>

      <div className="flex-1 p-0 md:p-6 lg:max-w-4xl lg:mx-auto w-full">
        <ChatWidget className="h-full rounded-none border-x-0 border-b-0 md:rounded-xl md:border" />
      </div>
    </div>
  );
}
