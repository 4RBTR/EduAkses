"use client";

import { useState, useTransition } from "react";
import { leaveClass } from "@/app/actions/class";
import { LogOut, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function LeaveClassButton({ classId }: { classId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLeave = () => {
    setError(null);
    startTransition(async () => {
      const result = await leaveClass(classId);
      if (result?.error) {
        setError(result.error);
        setIsOpen(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-lg transition-all"
      >
        Keluar Kelas
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-sm rounded-4xl border border-zinc-200 dark:border-zinc-800 p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Keluar dari Kelas?</h3>
            <p className="text-sm text-zinc-500">Anda akan kehilangan akses ke materi dan tugas di kelas ini.</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="h-12 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-xl font-bold text-sm tracking-tight hover:bg-zinc-200 transition-all"
          >
            Batal
          </button>
          <button
            onClick={handleLeave}
            disabled={isPending}
            className="h-12 bg-red-600 text-white rounded-xl font-bold text-sm tracking-tight flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
