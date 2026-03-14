"use client";

import { useState, useTransition } from "react";
import { updateAssignment } from "@/app/actions/assignment";
import { Edit2, X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  fileUrl: string | null;
}

export function EditAssignmentModal({ assignment }: { assignment: Assignment }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateAssignment(assignment.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Tugas berhasil diperbarui!");
        setIsOpen(false);
      }
    });
  };

  // Format date for datetime-local input
  const formatForInput = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
        title="Edit Tugas"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-primary" />
                  Edit Tugas
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Judul Tugas
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={assignment.title}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Deskripsi / Instruksi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={assignment.description || ""}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="dueDate" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Batas Waktu
                    </label>
                    <input
                      id="dueDate"
                      name="dueDate"
                      type="datetime-local"
                      defaultValue={formatForInput(assignment.dueDate)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fileUrl" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Link Lampiran
                    </label>
                    <input
                      id="fileUrl"
                      name="fileUrl"
                      type="url"
                      defaultValue={assignment.fileUrl || ""}
                      placeholder="https://..."
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
