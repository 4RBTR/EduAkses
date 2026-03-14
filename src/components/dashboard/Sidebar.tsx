"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Puzzle,
  Video,
  Bell,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Role = "TEACHER" | "CLASS_LEADER" | "STUDENT";

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const getMenu = () => {
    switch (role) {
      case "TEACHER":
        return [
          { name: "Class Overview", href: "/dashboard/teacher", icon: Users },
          { name: "Kalender Belajar", href: "/dashboard/calendar", icon: Calendar },
          { name: "Assignment Control", href: "/dashboard/teacher/assignments", icon: ClipboardList },
          { name: "Quiz Manager", href: "/dashboard/teacher/quizzes", icon: Puzzle },
          { name: "Zoomeet", href: "/dashboard/meet", icon: Video },
        ];
      case "CLASS_LEADER":
        return [
          { name: "Komando Dashboard", href: "/dashboard/leader", icon: LayoutDashboard },
          { name: "Kalender Belajar", href: "/dashboard/calendar", icon: Calendar },
          { name: "Jadwal & Reminders", href: "/dashboard/leader/schedule", icon: Calendar },
          { name: "Tugas Saya", href: "/dashboard/tasks", icon: ClipboardList },
          { name: "Kuis Adaptif", href: "/dashboard/quizzes", icon: Puzzle },
          { name: "Zoomeet", href: "/dashboard/meet", icon: Video },
        ];
 case "STUDENT":
      default:
        return [
          { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
          { name: "Kalender Belajar", href: "/dashboard/calendar", icon: Calendar },
          { name: "Tugas Saya", href: "/dashboard/tasks", icon: ClipboardList },
          { name: "Kuis Adaptif", href: "/dashboard/quizzes", icon: Puzzle },
          { name: "Zoomeet", href: "/dashboard/meet", icon: Video },
        ];
    }
  };

  const menuItems = getMenu();

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 p-4 border-b border-zinc-200 dark:border-zinc-800">
        {!isCollapsed && (
          <span className="font-bold text-xl bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-600">
            EduAkses
          </span>
        )}
        {isCollapsed && (
          <span className="font-bold text-xl text-primary mx-auto">EA</span>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 z-10 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors group",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={cn("shrink-0", isCollapsed ? "size-6" : "size-5")} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
