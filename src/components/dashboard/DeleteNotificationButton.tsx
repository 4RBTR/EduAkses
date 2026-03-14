"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteNotification } from "@/app/actions/leader";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteNotificationButtonProps {
  notificationId: string;
}

export function DeleteNotificationButton({ notificationId }: DeleteNotificationButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = () => {
    toast.warning("Hapus pengumuman ini?", {
      description: "Tindakan ini tidak dapat dibatalkan.",
      action: {
        label: "Hapus",
        onClick: async () => {
          setIsDeleting(true);
          try {
            const res = await deleteNotification(notificationId);
            if (res.error) {
              toast.error(res.error);
            } else {
              toast.success("Pengumuman berhasil dihapus");
              router.refresh();
            }
          } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus pengumuman");
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
      className="p-1 hover:bg-white/20 rounded-md transition-colors text-white/60 hover:text-white disabled:opacity-50"
      title="Hapus Pengumuman"
    >
      {isDeleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
