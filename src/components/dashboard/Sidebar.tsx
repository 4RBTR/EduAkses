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
  ChevronDown,
  BarChart3,
  MessageSquare,
  Library,
  Presentation,
  Archive,
  BookOpen,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Role = "TEACHER" | "CLASS_LEADER" | "STUDENT";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

interface SidebarProps {
  role: Role;
  isMobile?: boolean;
}

const getMenuCategories = (role: Role): MenuCategory[] => {
  switch (role) {
    case "TEACHER":
      return [
        {
          category: "UTAMA",
          items: [
            { name: "Class Overview", href: "/dashboard/teacher", icon: Users },
          ],
        },
        {
          category: "KELAS & TUGAS",
          items: [
            { name: "Kalender Belajar", href: "/dashboard/calendar", icon: Calendar },
            { name: "Jadwal & Reminder", href: "/dashboard/teacher/schedule", icon: Bell },
            { name: "Assignment Control", href: "/dashboard/teacher/assignments", icon: ClipboardList },
            { name: "Quiz Manager", href: "/dashboard/teacher/quizzes", icon: Puzzle },
            { name: "Laporan", href: "/dashboard/teacher/reports", icon: BarChart3 },
          ],
        },
        {
          category: "KOMUNIKASI",
          items: [
            { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
            { name: "Zoomeet", href: "/dashboard/meet", icon: Video },
          ],
        },
        {
          category: "KOLABORASI",
          items: [
            { name: "Sumbangan Materi", href: "/dashboard/scroll", icon: Library },
            { name: "Group Board", href: "/dashboard/board", icon: Presentation },
            { name: "Library Digital", href: "/dashboard/archive", icon: Archive },
            { name: "Workspace", href: "/dashboard/workspace", icon: BookOpen },
          ],
        },
      ];

    case "CLASS_LEADER":
      return [
        {
          category: "UTAMA",
          items: [
            { name: "Komando Dashboard", href: "/dashboard/leader", icon: LayoutDashboard },
          ],
        },
        {
          category: "KELAS & TUGAS",
          items: [
            { name: "Kalender Belajar", href: "/dashboard/calendar", icon: Calendar },
            { name: "Jadwal & Reminders", href: "/dashboard/leader/schedule", icon: Bell },
            { name: "Tugas Saya", href: "/dashboard/tasks", icon: ClipboardList },
            { name: "Kuis Adaptif", href: "/dashboard/quizzes", icon: Puzzle },
          ],
        },
        {
          category: "KOMUNIKASI",
          items: [
            { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
            { name: "Zoomeet", href: "/dashboard/meet", icon: Video },
          ],
        },
        {
          category: "KOLABORASI",
          items: [
            { name: "Sumbangan Materi", href: "/dashboard/scroll", icon: Library },
            { name: "Group Board", href: "/dashboard/board", icon: Presentation },
            { name: "Library Digital", href: "/dashboard/archive", icon: Archive },
            { name: "Workspace", href: "/dashboard/workspace", icon: BookOpen },
          ],
        },
      ];

    case "STUDENT":
    default:
      return [
        {
          category: "UTAMA",
          items: [
            { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
          ],
        },
        {
          category: "KELAS & TUGAS",
          items: [
            { name: "Kalender Belajar", href: "/dashboard/calendar", icon: Calendar },
            { name: "Tugas Saya", href: "/dashboard/tasks", icon: ClipboardList },
            { name: "Kuis Adaptif", href: "/dashboard/quizzes", icon: Puzzle },
          ],
        },
        {
          category: "KOMUNIKASI",
          items: [
            { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
            { name: "Zoomeet", href: "/dashboard/meet", icon: Video },
          ],
        },
        {
          category: "KOLABORASI",
          items: [
            { name: "Sumbangan Materi", href: "/dashboard/scroll", icon: Library },
            { name: "Group Board", href: "/dashboard/board", icon: Presentation },
            { name: "Library Digital", href: "/dashboard/archive", icon: Archive },
            { name: "Workspace", href: "/dashboard/workspace", icon: BookOpen },
          ],
        },
      ];
  }
};

export function Sidebar({ role, isMobile }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  // PERBAIKAN 1: Mengosongkan array ini agar semua kategori tertutup secara default saat web dibuka.
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const pathname = usePathname();
  const categories = getMenuCategories(role);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300",
        isMobile ? "w-full" : isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        {(!isCollapsed || isMobile) && (
          <span className="font-bold text-xl bg-clip-text text-transparent bg-linear-to-r from-primary to-indigo-600">
            EduAkses
          </span>
        )}
        {isCollapsed && !isMobile && (
          <span className="font-bold text-xl text-primary mx-auto">EA</span>
        )}
      </div>

      {/* Collapse Toggle */}
      {!isMobile && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 text-zinc-400 hover:text-primary dark:hover:text-primary z-10 transition-all shadow-sm"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {categories.map((cat, index) => {
          const isExpanded = expandedCategories.includes(cat.category);
          const hasActiveItem = cat.items.some((item) => pathname === item.href);

          return (
            <div key={cat.category} className="mb-1">
              {/* Category Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleCategory(cat.category)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-colors",
                    hasActiveItem
                      ? "text-primary"
                      : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
                  )}
                >
                  <span>{cat.category}</span>
                  <ChevronDown
                    size={12}
                    className={cn(
                      "transition-transform duration-200",
                      isExpanded ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>
              )}

              {/* Category Items with Accordion */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  !isCollapsed && !isExpanded ? "max-h-0" : "max-h-[500px]"
                )}
              >
                {/* PERBAIKAN 2: Sesuaikan padding saat collapsed agar tidak terlalu rapat */}
                <ul className={cn("space-y-0.5 px-2", isCollapsed ? "py-2" : "pt-0.5 pb-2")}>
                  {cat.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all group",
                            isActive
                              ? "bg-primary/10 text-primary font-semibold shadow-sm"
                              : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100",
                            isCollapsed ? "justify-center" : "justify-start"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon
                            className={cn(
                              "shrink-0 transition-transform group-hover:scale-110",
                              isCollapsed ? "size-6" : "size-4"
                            )}
                          />
                          {!isCollapsed && (
                            <span className="truncate text-sm">{item.name}</span>
                          )}
                          {isActive && !isCollapsed && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* PERBAIKAN 3: Divider tetap dimunculkan walau collapsed, tapi marginnya disesuaikan 
                  supaya membentuk pemisah antar grup icon. */}
              {index < categories.length - 1 && (
                <div 
                  className={cn(
                    "border-t border-zinc-100 dark:border-zinc-800/60",
                    isCollapsed ? "mx-6 my-1" : "mx-3"
                  )} 
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom: Search hint */}
      {!isCollapsed && (
        <div className="px-3 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 text-xs cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
            }}
          >
            <Search size={13} />
            <span className="flex-1">Cari sesuatu...</span>
            <kbd className="bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded px-1 py-0.5 text-[9px] font-mono group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              ⌘K
            </kbd>
          </div>
        </div>
      )}
    </div>
  );
}