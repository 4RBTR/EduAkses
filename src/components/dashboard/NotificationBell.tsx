"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Bell, Check, CheckCheck, MessageSquare,
  ClipboardList, Calendar, Info, Timer, Trash2
} from "lucide-react";
import { getUserNotifications, markAllNotificationsRead, markNotificationRead, deleteUserNotification, deleteAllUserNotifications } from "@/app/dashboard/_actions/notifications";
import { useGlobalEvents } from "@/hooks/useGlobalEvents";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: Date;
};

// ── Live Countdown per deadline ──────────────────────────────────────
function CountdownTimer({ dueDate }: { dueDate: Date }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  // Stabilize the date reference
  const timeKey = new Date(dueDate).getTime();

  useEffect(() => {
    const calc = () => {
      const diff = timeKey - Date.now();
      if (diff <= 0) {
        setTimeLeft("Sudah Lewat!");
        setIsUrgent(true);
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setIsUrgent(h < 3);
      setTimeLeft(`${h > 0 ? `${h}j ` : ""}${m}m ${s}s`);
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [timeKey]);

  return (
    <span
      className={cn(
        "text-[10px] font-mono font-bold mt-0.5",
        isUrgent ? "text-red-500 dark:text-red-400" : "text-orange-500 dark:text-orange-400"
      )}
    >
      ⏳ {timeLeft}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export function NotificationBell({ currentUserId }: { currentUserId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { events } = useGlobalEvents();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const seenNotifsRef = useRef<Set<string>>(new Set());
  const router = useRouter();

  const fetchNotifs = async () => {
    const notifData = await getUserNotifications() as Notification[];
    setNotifications(notifData);
    setUnreadCount(notifData.filter((n) => !n.isRead).length);
  };

  // Initial fetch + polling fallback (60s)
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(interval);
  }, []);

  // ── Supabase Realtime: instant notification push ──
  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel(`user-notifications-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `userId=eq.${currentUserId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          
          if (seenNotifsRef.current.has(newNotif.id)) return;
          seenNotifsRef.current.add(newNotif.id);

          const formatted: Notification = {
            id: newNotif.id,
            title: newNotif.title,
            message: newNotif.message,
            type: newNotif.type,
            isRead: false,
            link: newNotif.link ?? null,
            createdAt: new Date(newNotif.createdAt),
          };
          setNotifications((prev) => {
            if (prev.some((n) => n.id === formatted.id)) return prev;
            return [formatted, ...prev].slice(0, 20);
          });
          setUnreadCount((prev) => prev + 1);
          
          // Show pop-up toast
          toast(formatted.title, {
            description: formatted.message,
            duration: 4000,
            icon: getIcon(formatted.type),
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  // Filter urgent events from global hook (less than 24h)
  const deadlines = useMemo(() => {
    const now = new Date().getTime();
    return events
      .filter((e: any) => e.type === "TASK" && (e.time.getTime() - now) < 86_400_000 && (e.time.getTime() - now) > 0)
      .map((e: any) => ({
        id: e.id,
        title: e.title,
        dueDate: e.time,
        className: "Tugas Workspace"
      }));
  }, [events]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRead = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (n.link) { router.push(n.link); setOpen(false); }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleDeleteAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    try {
      await deleteAllUserNotifications();
    } catch (error) {
      console.error("Failed to delete all notifications", error);
      toast.error("Gagal menghapus semua notifikasi");
    }
  };

  const handleDeleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents handleRead from firing
    
    // Optimistic delete
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    
    // Fix unread count if the deleted notif was unread
    const notif = notifications.find((n) => n.id === id);
    if (notif && !notif.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await deleteUserNotification(id);
    } catch (error) {
      console.error("Failed to delete notification", error);
      toast.error("Gagal menghapus notifikasi");
      // Optionally rollback here if needed
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "MESSAGE": return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "ASSIGNMENT": return <ClipboardList className="w-4 h-4 text-orange-500" />;
      case "QUIZ": return <Calendar className="w-4 h-4 text-purple-500" />;
      default: return <Info className="w-4 h-4 text-zinc-500" />;
    }
  };

  const hasUrgent = deadlines.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        title="Notifikasi"
      >
        <Bell size={20} />

        {/* Unread notification badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-blue-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none border-2 border-white dark:border-zinc-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Urgent deadline red dot (separate, bottom-right of badge) */}
        {hasUrgent && unreadCount === 0 && (
          <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
        )}
        {hasUrgent && unreadCount > 0 && (
          <span className="absolute bottom-1 right-1 bg-red-500 w-2 h-2 rounded-full border border-white dark:border-zinc-950 animate-pulse" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Notifikasi</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-primary font-semibold hover:opacity-70 transition-opacity flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" /> Tandai Semua
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="text-xs text-red-500 font-semibold hover:opacity-70 transition-opacity flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Hapus Semua
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[460px] overflow-y-auto">
            {/* ─── Deadline Urgency Section ─────────────────────── */}
            {deadlines.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-red-500">
                    Deadline &lt; 24 Jam
                  </span>
                </div>
                {deadlines.map((d: any) => (
                  <button
                    key={d.id}
                    onClick={() => { router.push("/dashboard/tasks"); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border-l-2 border-red-400 dark:border-red-600 bg-red-50/40 dark:bg-red-950/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <ClipboardList className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{d.title}</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{d.className}</p>
                      <CountdownTimer dueDate={d.dueDate} />
                    </div>
                  </button>
                ))}
                <div className="mx-3 border-t border-zinc-100 dark:border-zinc-800 my-1" />
              </div>
            )}

            {/* ─── General Notifications ────────────────────────── */}
            {notifications.length === 0 && deadlines.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Tidak ada notifikasi</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-6 text-center">
                <Check className="w-5 h-5 text-zinc-300 dark:text-zinc-700 mx-auto mb-1" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Tidak ada notifikasi lain</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 group cursor-pointer",
                    !n.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                  )}
                  onClick={() => handleRead(n)}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className={cn("text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate", !n.isRead && "text-blue-800 dark:text-blue-200")}>
                      {n.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[9px] text-zinc-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 mt-1 shrink-0">
                    {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                    
                    <button 
                      onClick={(e) => handleDeleteNotif(e, n.id)}
                      className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Hapus notifikasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
