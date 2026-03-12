"use client";

import { LogOut, User } from "lucide-react";
import { signOut } from "next-auth/react";

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
          {user.role?.replace("_", " ").toLowerCase() || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* User Profile Info */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {user.name || "User"}
            </span>
            <span className="text-xs text-zinc-500 capitalize">
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
