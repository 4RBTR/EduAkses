"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Puzzle,
  Video,
  MessageSquare,
  Library,
  Presentation,
  Archive,
  BookOpen,
  Users,
  BarChart3,
  Bell,
  X,
  ArrowRight,
  Hash,
} from "lucide-react";

type Role = "TEACHER" | "CLASS_LEADER" | "STUDENT";

interface CommandItem {
  id: string;
  name: string;
  href: string;
  category: string;
  icon: React.ElementType;
  keywords?: string[];
}

const ALL_ROUTES: CommandItem[] = [
  // Dashboard Overview
  { id: "dashboard", name: "Overview Dashboard", href: "/dashboard", category: "Navigasi", icon: LayoutDashboard, keywords: ["home", "beranda"] },
  { id: "teacher", name: "Class Overview (Guru)", href: "/dashboard/teacher", category: "Navigasi", icon: Users, keywords: ["kelas", "guru", "teacher"] },
  { id: "leader", name: "Komando Dashboard", href: "/dashboard/leader", category: "Navigasi", icon: LayoutDashboard, keywords: ["ketua", "leader"] },
  // Kelas & Tugas
  { id: "calendar", name: "Kalender Belajar", href: "/dashboard/calendar", category: "Kelas & Tugas", icon: Calendar, keywords: ["jadwal", "hari", "tanggal"] },
  { id: "tasks", name: "Tugas Saya", href: "/dashboard/tasks", category: "Kelas & Tugas", icon: ClipboardList, keywords: ["assignment", "pr"] },
  { id: "quizzes", name: "Kuis Adaptif", href: "/dashboard/quizzes", category: "Kelas & Tugas", icon: Puzzle, keywords: ["quiz", "ujian", "soal"] },
  { id: "teacher-assignments", name: "Assignment Control", href: "/dashboard/teacher/assignments", category: "Kelas & Tugas", icon: ClipboardList, keywords: ["buat tugas", "kelola tugas"] },
  { id: "teacher-quizzes", name: "Quiz Manager", href: "/dashboard/teacher/quizzes", category: "Kelas & Tugas", icon: Puzzle, keywords: ["buat kuis"] },
  { id: "teacher-reports", name: "Laporan Kelas", href: "/dashboard/teacher/reports", category: "Kelas & Tugas", icon: BarChart3, keywords: ["report", "nilai", "rekap"] },
  { id: "teacher-schedule", name: "Jadwal & Reminder (Guru)", href: "/dashboard/teacher/schedule", category: "Kelas & Tugas", icon: Bell, keywords: ["reminder"] },
  { id: "leader-schedule", name: "Jadwal & Reminders (Ketua)", href: "/dashboard/leader/schedule", category: "Kelas & Tugas", icon: Bell, keywords: ["reminder"] },
  // Komunikasi
  { id: "chat", name: "Chat", href: "/dashboard/chat", category: "Komunikasi", icon: MessageSquare, keywords: ["pesan", "message", "dm"] },
  { id: "meet", name: "Zoomeet", href: "/dashboard/meet", category: "Komunikasi", icon: Video, keywords: ["zoom", "video call", "meeting"] },
  // Kolaborasi
  { id: "scroll", name: "Sumbangan Materi", href: "/dashboard/scroll", category: "Kolaborasi", icon: Library, keywords: ["materi", "upload", "bahan"] },
  { id: "board", name: "Group Board", href: "/dashboard/board", category: "Kolaborasi", icon: Presentation, keywords: ["whiteboard", "kanvas"] },
  { id: "archive", name: "Library Digital", href: "/dashboard/archive", category: "Kolaborasi", icon: Archive, keywords: ["perpustakaan", "dokumen"] },
  { id: "workspace", name: "Workspace / Notes", href: "/dashboard/workspace", category: "Kolaborasi", icon: BookOpen, keywords: ["catatan", "notes", "notion"] },
];

function filterRoutesByRole(role: Role): CommandItem[] {
  return ALL_ROUTES.filter((r) => {
    // Teacher can see everything except leader-specific dashboard
    if (role === "TEACHER") {
      return !["leader", "leader-schedule"].includes(r.id);
    }
    
    // Class Leader can see common + leader items, but NO teacher reports/management
    if (role === "CLASS_LEADER") {
      const teacherOnly = [
        "teacher", 
        "teacher-assignments", 
        "teacher-quizzes", 
        "teacher-reports", 
        "teacher-schedule"
      ];
      return !teacherOnly.includes(r.id);
    }
    
    // Student can ONLY see student items
    const nonStudent = [
      "teacher", 
      "teacher-assignments", 
      "teacher-quizzes", 
      "teacher-reports", 
      "teacher-schedule",
      "leader",
      "leader-schedule"
    ];
    return !nonStudent.includes(r.id);
  });
}

interface CommandPaletteProps {
  role: Role;
}

export function CommandPalette({ role }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const routes = filterRoutesByRole(role);

  const filtered = query.trim()
    ? routes.filter((r) => {
        const q = query.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.keywords?.some((k) => k.toLowerCase().includes(q))
        );
      })
    : routes;

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      router.push(href);
      close();
    },
    [router, close]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (flatFiltered[selectedIndex]) {
        navigate(flatFiltered[selectedIndex].href);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-start justify-center pt-[15vh] px-4"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <Search size={18} className="text-zinc-400 dark:text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Cari halaman, fitur, atau tugas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 rounded px-1.5 py-0.5 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[350px] overflow-y-auto py-2">
          {Object.entries(grouped).length === 0 ? (
            <div className="py-12 text-center">
              <Hash className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Tidak ada hasil untuk &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-1">
                <p className="px-4 py-1 text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-zinc-600">
                  {category}
                </p>
                {items.map((item) => {
                  const globalIdx = flatFiltered.indexOf(item);
                  const isSelected = globalIdx === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.href)}
                      onMouseEnter={() => setSelectedIndex(globalIdx)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isSelected ? "bg-primary/20" : "bg-zinc-100 dark:bg-zinc-800"
                      )}>
                        <Icon size={14} />
                      </div>
                      <span className="flex-1 text-left font-medium">{item.name}</span>
                      {isSelected && (
                        <ArrowRight size={14} className="text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 text-[10px] text-zinc-400 dark:text-zinc-600">
          <span className="flex items-center gap-1">
            <kbd className="bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 font-mono">↑↓</kbd>
            Navigasi
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 font-mono">Enter</kbd>
            Buka
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-zinc-100 dark:bg-zinc-800 rounded px-1 py-0.5 font-mono">Esc</kbd>
            Tutup
          </span>
        </div>
      </div>
    </div>
  );
}
