"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  role: "user" | "alfred";
  text: string;
  timestamp: Date;
}

const SAMPLE_MESSAGES: ChatMessage[] = [
  { id: "1", role: "alfred", text: "Good morning! I've updated your schedule. You have a meeting at 10 AM.", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: "2", role: "user", text: "Thanks Alfred. Can you move my lunch to 1 PM?", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: "3", role: "alfred", text: "Done. Lunch is now at 1 PM. Anything else?", timestamp: new Date(Date.now() - 1000 * 60 * 29) },
];

export function ChatWidget({ className }: { className?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "alfred",
          text: "I've noted that. Is there anything else you'd like me to handle?",
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  };

  return (
    <div className={cn("flex flex-col h-full bg-card/60 backdrop-blur-md border border-border rounded-xl shadow-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-none mb-1">Chat with Alfred</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <div className="text-center text-[10px] text-muted-foreground my-2 font-medium uppercase tracking-wider">Today</div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex w-full",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm border border-border/50"
                )}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-muted/20 border-t border-border/40">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-muted/50 hover:bg-muted focus:bg-background border border-transparent focus:border-border rounded-full px-4 py-2.5 text-sm outline-none transition-all placeholder:text-muted-foreground/70 shadow-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim()}
            className="rounded-full w-9 h-9 shrink-0 transition-transform active:scale-95"
          >
            <Send size={15} className="ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
