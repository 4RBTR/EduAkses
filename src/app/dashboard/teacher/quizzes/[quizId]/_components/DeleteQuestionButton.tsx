"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteQuestion } from "@/app/actions/teacher-quiz";

export function DeleteQuestionButton({ questionId }: { questionId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Hapus soal ini?")) {
      startTransition(async () => {
        try {
          await deleteQuestion(questionId);
        } catch (error) {
          console.error(error);
          alert("Gagal menghapus soal.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-zinc-400 hover:text-red-500 transition-colors p-2 bg-zinc-50 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-500/10 rounded-lg"
      title="Hapus Soal"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
