"use client";

import { useTransition } from "react";
import { deleteAssignment } from "@/app/actions/assignment";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function DeleteAssignmentButton({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    toast.warning("Hapus tugas ini?", {
      description: "Tindakan ini akan menghapus tugas secara permanen.",
      action: {
        label: "Hapus",
        onClick: () => {
          startTransition(async () => {
            try {
              await deleteAssignment(assignmentId);
              toast.success("Tugas berhasil dihapus");
            } catch (error) {
              console.error(error);
              toast.error("Gagal menghapus tugas.");
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
      className="text-zinc-400 hover:text-red-500 transition-colors p-2"
      title="Hapus Tugas"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
