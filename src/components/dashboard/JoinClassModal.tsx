"use client";

import { useState, useTransition } from "react";
import { joinClass } from "@/app/actions/class";
import { Plus, X, Loader2, KeyRound } from "lucide-react";

export default function JoinClassModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const inviteCode = formData.get("inviteCode") as string;
    
    setError(null);
    startTransition(async () => {
      const result = await joinClass(inviteCode);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        (e.target as HTMLFormElement).reset();
        window.location.reload(); // Refresh to show new class
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-white dark:text-zinc-100 px-6 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
      >
        <Plus className="w-5 h-5" />
        Gabung Kelas
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Masuk ke Kelas
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Mintalah kode undangan kepada Pengajar Anda untuk bergabung ke dalam kelas.
                </p>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="inviteCode" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Kode Undangan
                  </label>
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-mono uppercase tracking-widest placeholder:tracking-normal"
                    placeholder="Masukkan Kode (misal: clm123...)"
                  />
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
                        Bergabung...
                      </>
                    ) : (
                      "Gabung Sekarang"
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
