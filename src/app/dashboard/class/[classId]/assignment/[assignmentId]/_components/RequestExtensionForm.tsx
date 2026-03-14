"use client";

import { useState, useTransition } from "react";
import { requestExtension } from "@/app/actions/assignment";
import { Send, Loader2, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export function RequestExtensionForm({ 
  assignmentId,
  currentRequest
}: { 
  assignmentId: string;
  currentRequest?: { reason: string; status: "PENDING" | "APPROVED" | "REJECTED" } | null;
}) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    startTransition(async () => {
      const result = await requestExtension(assignmentId, reason);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Permintaan dispensasi terkirim!");
        setReason("");
      }
    });
  };

  if (currentRequest?.status === "PENDING") {
    return (
      <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold">
          <Clock className="w-5 h-5" />
          Permintaan Menunggu Persetujuan
        </div>
        <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80">
          Anda telah meminta dispensasi waktu. Silakan tunggu konfirmasi dari guru untuk dapat mengumpulkan tugas.
        </p>
        <div className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-indigo-100 dark:border-indigo-800 text-xs italic">
          "{currentRequest.reason}"
        </div>
      </div>
    );
  }

  if (currentRequest?.status === "REJECTED") {
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 rounded-3xl space-y-3">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
          <AlertCircle className="w-5 h-5" />
          Permintaan Ditolak
        </div>
        <p className="text-sm text-red-600/80 dark:text-red-400/80">
          Maaf, permintaan dispensasi Anda telah ditolak oleh guru.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Minta Dispensasi Waktu</h3>
        <p className="text-xs text-zinc-500">Batas waktu telah berakhir. Berikan alasan yang jelas mengapa Anda terlambat agar guru dapat memberikan izin pengumpulan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Tulis alasan Anda di sini..."
          className="w-full h-24 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
        />
        <button
          type="submit"
          disabled={isPending || !reason}
          className="w-full py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Kirim Permintaan
        </button>
      </form>
    </div>
  );
}
