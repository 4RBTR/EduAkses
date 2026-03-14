"use client";

import { useState, useTransition } from "react";
import { gradeSubmission } from "@/app/actions/grading";
import { Loader2, CheckCircle, Save } from "lucide-react";
import { toast } from "sonner";

interface GradeSubmissionFormProps {
  submissionId: string;
  initialGrade: number | null;
  initialComment: string | null;
}

export function GradeSubmissionForm({ submissionId, initialGrade, initialComment }: GradeSubmissionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [grade, setGrade] = useState<string>(initialGrade?.toString() || "");
  const [comment, setComment] = useState(initialComment || "");
  const [success, setSuccess] = useState(false);

  const handleGrade = async () => {
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return toast.error("Masukkan nilai yang valid (0-100)");

    startTransition(async () => {
      const result = await gradeSubmission(submissionId, numGrade, comment);
      if (result.success) {
        setSuccess(true);
        toast.success("Nilai berhasil disimpan!");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Berikan Komentar</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Contoh: Sangat detail, pertahankan!"
            className="w-full h-24 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-semibold focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
          />
        </div>
        <div className="w-full md:w-32 space-y-2">
          <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Nilai (0-100)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 text-xl font-black text-primary focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
        <button
          onClick={handleGrade}
          disabled={isPending}
          className="h-12 px-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : success ? (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {success ? "Tersimpan" : "Simpan Nilai"}
        </button>
      </div>
    </div>
  );
}
