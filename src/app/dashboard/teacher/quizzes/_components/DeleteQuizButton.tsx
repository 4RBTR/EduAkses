"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteQuiz } from "@/app/actions/teacher-quiz";

export function DeleteQuizButton({ quizId }: { quizId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus kuis ini? Semua soal berserta nilai kuis siswa terkait akan ikut terhapus secara permanen.")) {
      startTransition(async () => {
        try {
          await deleteQuiz(quizId);
        } catch (error) {
          console.error(error);
          alert("Gagal menghapus kuis.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-zinc-400 hover:text-red-500 transition-colors p-1"
      title="Hapus Kuis"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
