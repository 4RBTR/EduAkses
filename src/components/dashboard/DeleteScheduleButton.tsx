"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteSchedule } from "@/app/actions/leader";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteScheduleButtonProps {
  scheduleId: string;
}

export function DeleteScheduleButton({ scheduleId }: DeleteScheduleButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    toast.warning("Hapus jadwal ini?", {
      description: "Tindakan ini tidak dapat dibatalkan.",
      action: {
        label: "Hapus",
        onClick: async () => {
          setIsDeleting(true);
          try {
            const res = await deleteSchedule(scheduleId);
            if (res.error) {
              toast.error(res.error);
            } else {
              toast.success("Jadwal berhasil dihapus");
              router.refresh();
            }
          } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus jadwal");
          } finally {
            setIsDeleting(false);
          }
        },
      },
      cancel: {
        label: "Batal",
        onClick: () => {},
      },
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-zinc-400 hover:text-red-500 disabled:opacity-50"
      title="Hapus Jadwal"
    >
      {isDeleting ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Trash2 className="w-3 h-3" />
      )}
    </button>
  );
}
