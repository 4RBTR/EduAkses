"use client";

import { useTransition, useRef } from "react";
import { createAssignment } from "@/app/actions/assignment";
import { PlusCircle, Loader2 } from "lucide-react";

interface ClassOption {
  id: string;
  name: string;
}

export function CreateAssignmentForm({ classes }: { classes: ClassOption[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await createAssignment(formData);
      if (result?.error) {
        alert(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-2">
         <PlusCircle className="w-5 h-5 text-primary" />
         <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Buat Tugas Baru</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Judul Tugas
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Contoh: Laporan Praktikum Kimia"
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="classId" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Kelas
          </label>
          <select
            id="classId"
            name="classId"
            required
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            defaultValue=""
          >
            <option value="" disabled>Pilih Kelas...</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label htmlFor="description" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Deskripsi / Instruksi
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Berikan instruksi detail untuk siswa..."
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dueDate" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Batas Waktu (Opsional)
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="datetime-local"
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fileUrl" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Lampiran File (Link GDrive/Cloud)
          </label>
          <input
            id="fileUrl"
            name="fileUrl"
            type="url"
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all disabled:opacity-50 shadow-lg shadow-zinc-200/50 dark:shadow-none"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Terbitkan Tugas
            </>
          )}
        </button>
      </div>
    </form>
  );
}
