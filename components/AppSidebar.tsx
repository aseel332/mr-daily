"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  Menu,
  X
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: <Home size={18} /> },
  { label: "Calendar", href: "/calendar", icon: <Calendar size={18} /> },
  { label: "Tasks", href: "/todos", icon: <CheckSquare size={18} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={18} /> },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Toggle */}
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="font-semibold ml-2">Alfred</span>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-[2px]"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
          "w-[240px] -translate-x-full",
          isMobileOpen && "translate-x-0 shadow-2xl",
          "md:translate-x-0 md:shadow-none",
          isCollapsed ? "md:w-[60px]" : "md:w-[240px]"
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center p-3 mb-2 shrink-0", isCollapsed ? "md:justify-center" : "justify-between")}>
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-2 overflow-hidden px-1">
              <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-xs font-bold text-neon-cyan shrink-0">
                {user?.firstName?.[0] || "A"}
              </div>
              <span className="text-sm font-medium truncate text-zinc-200">
                {user?.fullName || "Alfred"}
              </span>
            </div>
          )}

          {/* Desktop Collapse */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-neon-cyan transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Mobile Close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-200",
                  isActive
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200 border border-transparent"
                )}
              >
                <div className={cn("flex items-center justify-center shrink-0", isCollapsed ? "md:w-full" : "")}>
                  {item.icon}
                </div>
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-300",
                  isCollapsed ? "md:opacity-0 md:w-0 md:hidden" : "opacity-100"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="p-2 border-t border-white/[0.06] shrink-0">
          <div className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-zinc-500 hover:bg-white/5 cursor-pointer mt-1",
            isCollapsed ? "md:justify-center" : ""
          )}>
            <div className="shrink-0"><UserButton /></div>
            <span className={cn(
              "whitespace-nowrap transition-opacity duration-300",
              isCollapsed ? "md:opacity-0 md:w-0 md:hidden" : "opacity-100"
            )}>
              Account
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
