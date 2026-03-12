"use client";

import { useState, useTransition } from "react";
import { sendReminder } from "@/app/actions/schedule";
import { Bell, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReminderButton({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();
  const [isSent, setIsSent] = useState(false);

  const handleReminder = () => {
    startTransition(async () => {
      try {
        await sendReminder(assignmentId);
        setIsSent(true);
        setTimeout(() => setIsSent(false), 3000); // Reset after 3s
      } catch (error) {
        console.error("Failed to send reminder", error);
        alert("Gagal mengirim reminder: Anda mungkin tidak memiliki akses");
      }
    });
  };

  return (
    <button
      onClick={handleReminder}
      disabled={isPending || isSent}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors w-full sm:w-auto",
        isSent 
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isSent ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : (
        <Bell className="w-4 h-4" />
      )}
      <span>{isPending ? "Mengirim..." : isSent ? "Terkirim" : "Kirim Reminder"}</span>
    </button>
  );
}
