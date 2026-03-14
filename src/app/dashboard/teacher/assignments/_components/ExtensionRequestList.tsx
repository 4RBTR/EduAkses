"use client";

import { useTransition } from "react";
import { manageExtension } from "@/app/actions/assignment";
import { Check, X, Clock, User, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExtensionRequest {
  id: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  student: {
    name: string;
  };
  assignment: {
    title: string;
    class: {
      name: string;
    };
  };
}

export function ExtensionRequestList({ requests }: { requests: ExtensionRequest[] }) {
  const [isPending, startTransition] = useTransition();

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await manageExtension(id, status);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(status === "APPROVED" ? "Dispensasi disetujui" : "Dispensasi ditolak");
      }
    });
  };

  if (requests.length === 0) {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center">
        <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
        <p className="text-sm text-zinc-500">Tidak ada permintaan dispensasi tertunda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div 
          key={req.id} 
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded uppercase">
                {req.assignment.class.name}
              </span>
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {req.assignment.title}
              </h4>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                <User className="w-3 h-3" />
                {req.student.name}
              </span>
            </div>
            <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 italic">"{req.reason}"</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => handleAction(req.id, "REJECTED")}
              disabled={isPending}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="Tolak"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleAction(req.id, "APPROVED")}
              disabled={isPending}
              className="p-2 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 font-bold text-xs"
              title="Setujui"
            >
              <Check className="w-5 h-5" />
              Setujui
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
