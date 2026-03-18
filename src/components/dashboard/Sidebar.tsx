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
  LogOut,
  BarChart3,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Role = "TEACHER" | "CLASS_LEADER" | "STUDENT";

interface SidebarProps {
  role: Role;
  isMobile?: boolean;
}

export function Sidebar({ role, isMobile }: SidebarProps) {
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
          { name: "Laporan", href: "/dashboard/teacher/reports", icon: BarChart3 },
          { name: "Priority Inbox", href: "/dashboard/messages", icon: MessageSquare },
          { name: "Zoomeet", href: "/dashboard/meet", icon: Video },
        ];
      case "CLASS_LEADER":
        return [
          { name: "Komando Dashboard", href: "/dashboard/leader", icon: LayoutDashboard },
          { name: "Kalender Belajar", href: "/dashboard/calendar", icon: Calendar },
          { name: "Jadwal & Reminders", href: "/dashboard/leader/schedule", icon: Calendar },
          { name: "Tugas Saya", href: "/dashboard/tasks", icon: ClipboardList },
          { name: "Kuis Adaptif", href: "/dashboard/quizzes", icon: Puzzle },
          { name: "Priority Inbox", href: "/dashboard/messages", icon: MessageSquare },
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
        isMobile ? "w-full" : (isCollapsed ? "w-20" : "w-64")
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 p-4 border-b border-zinc-200 dark:border-zinc-800">
        {(!isCollapsed || isMobile) && (
          <span className="font-bold text-xl bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-600">
            EduAkses
          </span>
        )}
        {isCollapsed && !isMobile && (
          <span className="font-bold text-xl text-primary mx-auto">EA</span>
        )}
      </div>

      {/* Collapse Toggle - Hide on mobile */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 text-zinc-400 hover:text-primary dark:hover:text-primary z-10 transition-all shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}

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
                    "flex items-center gap-3 rounded-md px-3 py-2.5 transition-all group",
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={cn("shrink-0 transition-transform group-hover:scale-110", isCollapsed ? "size-6" : "size-5")} />
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
