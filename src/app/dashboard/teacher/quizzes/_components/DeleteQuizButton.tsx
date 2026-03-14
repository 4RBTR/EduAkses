"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteQuiz } from "@/app/actions/teacher-quiz";
import { toast } from "sonner";

export function DeleteQuizButton({ quizId }: { quizId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    toast.warning("Hapus kuis ini?", {
      description: "Semua soal dan nilai kuis siswa terkait akan dihapus permanen.",
      action: {
        label: "Hapus",
        onClick: () => {
          startTransition(async () => {
            try {
              await deleteQuiz(quizId);
              toast.success("Kuis berhasil dihapus");
            } catch (error) {
              console.error(error);
              toast.error("Gagal menghapus kuis.");
            }
          });
        }
      },
      cancel: {
        label: "Batal",
        onClick: () => {}
      }
    });
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
