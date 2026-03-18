"use client";

import { LogOut, User, Menu } from "lucide-react";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 capitalize">
          {user.role?.replace("_", " ").toLowerCase() || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell />

        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* User Profile Info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user.name || "User"}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
              {user.role?.replace("_", " ").toLowerCase()}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <User size={18} />
          </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2"
          title="Keluar"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
