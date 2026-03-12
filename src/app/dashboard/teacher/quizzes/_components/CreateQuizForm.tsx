"use client";

import { useFormStatus } from "react-dom";
import { PlusCircle, Loader2 } from "lucide-react";
import { createQuiz } from "@/app/actions/teacher-quiz";
import { useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
      {pending ? "Menyimpan..." : "Buat Kuis Baru"}
    </button>
  );
}

interface ClassOption {
  id: string;
  name: string;
}

export function CreateQuizForm({ classes }: { classes: ClassOption[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  const actionHandler = async (formData: FormData) => {
    try {
      await createQuiz(formData);
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      alert("Gagal membuat kuis.");
    }
  };

  return (
    <form ref={formRef} action={actionHandler} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Buat Kuis Baru</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Judul Kuis
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            placeholder="Contoh: Kuis Biologi Bab 3 (Evolusi)"
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="classId" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Kaitkan ke Kelas
          </label>
          <select
            id="classId"
            name="classId"
            required
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100"
            defaultValue=""
          >
            <option value="" disabled>Pilih Kelas...</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
