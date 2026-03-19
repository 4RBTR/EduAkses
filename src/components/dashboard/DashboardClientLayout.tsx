"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { CommandPalette } from "./CommandPalette";
import { cn } from "@/lib/utils";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function DashboardClientLayout({ children, user }: DashboardClientLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const role = (user.role as "TEACHER" | "CLASS_LEADER" | "STUDENT") || "STUDENT";

  return (
    <div className="flex h-screen w-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
      {/* Command Palette — global, available on all pages */}
      <CommandPalette role={role} />

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar role={role} />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "bg-black/60 backdrop-blur-sm" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-950 transition-transform duration-300 ease-in-out z-50",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar role={role} isMobile />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          user={user}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className={cn(
          "flex-1 relative z-0",
          (pathname?.startsWith("/dashboard/chat") || pathname?.startsWith("/dashboard/workspace")) 
            ? "overflow-hidden" 
            : "overflow-y-auto p-4 md:p-6 pb-20 md:pb-6"
        )}>
          <div className={cn(
            "mx-auto h-full",
            (pathname?.startsWith("/dashboard/chat") || pathname?.startsWith("/dashboard/workspace")) ? "" : "max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
