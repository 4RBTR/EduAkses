"use client";

import { useTransition } from "react";
import { deleteAssignment } from "@/app/actions/assignment";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus tugas ini secara permanen?")) {
      startTransition(async () => {
        try {
          await deleteAssignment(assignmentId);
        } catch (error) {
          console.error(error);
          alert("Gagal menghapus tugas.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-zinc-400 hover:text-red-500 transition-colors p-2"
      title="Hapus Tugas"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
