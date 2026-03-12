"use client";

import { useState, useTransition } from "react";
import { gradeSubmission } from "@/app/actions/assignment";
import { Loader2, Check } from "lucide-react";

export function GradeForm({ 
  submissionId, 
  initialGrade, 
  initialComment 
}: { 
  submissionId: string;
  initialGrade?: number | null;
  initialComment?: string | null;
}) {
  const [grade, setGrade] = useState(initialGrade?.toString() || "");
  const [comment, setComment] = useState(initialComment || "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!grade) {
      setMessage({ type: 'error', text: 'Nilai wajib diisi' });
      return;
    }

    startTransition(async () => {
      const result = await gradeSubmission(submissionId, parseFloat(grade), comment);
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Tersimpan!' });
        setTimeout(() => setMessage(null), 3000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Penilaian</span>
        {message && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </span>
        )}
      </div>
      
      <div className="space-y-1.5">
        <label className="text-xs text-zinc-600 dark:text-zinc-400 font-bold">Nilai (0-100)</label>
        <input 
          type="number"
          min="0"
          max="100"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full h-10 px-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          placeholder="e.g. 85"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-zinc-600 dark:text-zinc-400 font-bold">Komentar Guru (Opsional)</label>
        <textarea 
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full h-20 p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
          placeholder="Kerja bagus!..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full h-10 mt-2 bg-primary text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {initialGrade !== null && initialGrade !== undefined ? "Perbarui Nilai" : "Simpan Nilai"}
      </button>
    </form>
  );
}
