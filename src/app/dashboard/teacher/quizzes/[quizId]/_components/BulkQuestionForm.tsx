"use client";

import { useState, useTransition } from "react";
import { bulkCreateQuestions } from "@/app/actions/bulk-quiz";
import { Sparkles, Loader2, Info } from "lucide-react";

export function BulkQuestionForm({ quizId }: { quizId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!rawText.trim()) return;

    setError(null);
    startTransition(async () => {
      const result = await bulkCreateQuestions(quizId, rawText);
      if (result?.error) {
        setError(result.error);
      } else {
        setRawText("");
        setIsOpen(false);
        window.location.reload();
      }
    });
  };

  return (
    <div className="bg-linear-to-br from-indigo-500/5 to-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Sparkles className="w-5 h-5" />
          Konverter Kuis AI (Bulk Upload)
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-black uppercase tracking-widest text-primary hover:underline"
        >
          {isOpen ? "Tutup" : "Buka Konverter"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-start gap-3 text-xs text-zinc-500 font-medium">
              <Info className="w-4 h-4 text-primary shrink-0" />
              <p>
                Gunakan format berikut (pisahkan antar soal dengan baris kosong): <br />
                <code className="text-[10px] block mt-2 bg-zinc-100 dark:bg-zinc-800 p-2 rounded">
                  Q: Apa ibu kota Indonesia? <br />
                  A: Jakarta, Surabaya, Bandung, Medan <br />
                  K: Jakarta
                </code>
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <textarea
              className="w-full h-48 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="Tempel soal kuis Anda di sini..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            
            <button
              onClick={handleSubmit}
              disabled={isPending || !rawText.trim()}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Konversi & Tambahkan Sekarang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
