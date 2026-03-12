"use client";

import { useState, useTransition } from "react";
import { submitAssignment } from "@/app/actions/assignment";
import { 
  FileUp, 
  Loader2, 
  X,
  Plus,
  Link as LinkIcon
} from "lucide-react";

export function SubmitAssignmentModal({ 
  assignmentId, 
  assignmentTitle 
}: { 
  assignmentId: string;
  assignmentTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append("content", content);
    formData.append("fileUrl", fileUrl);

    startTransition(async () => {
      const result = await submitAssignment(assignmentId, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        window.location.reload();
      }
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Kirim Tugas
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
               <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic">Kirim Tugas</h3>
               <p className="text-xs text-zinc-500 font-medium">{assignmentTitle}</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Pesan / Catatan</label>
              <textarea
                className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="Tulis pesan untuk guru Anda..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Link File (GDrive/Cloud)</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  className="w-full h-12 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="https://drive.google.com/..."
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                />
              </div>
              <p className="text-[10px] text-zinc-400">Pastikan file dapat diakses oleh Guru.</p>
            </div>

            <button
              type="submit"
              disabled={isPending || (!content && !fileUrl)}
              className="w-full h-14 bg-primary text-white rounded-3xl font-bold flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
              Kirim Sekarang (+50 XP)
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
