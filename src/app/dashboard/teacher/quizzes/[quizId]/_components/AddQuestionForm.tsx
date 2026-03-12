"use client";

import { useFormStatus } from "react-dom";
import { PlusCircle, Loader2 } from "lucide-react";
import { addQuestion } from "@/app/actions/teacher-quiz";
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
      {pending ? "Menyimpan..." : "Tambahkan Soal"}
    </button>
  );
}

export function AddQuestionForm({ quizId }: { quizId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  const actionHandler = async (formData: FormData) => {
    formData.append("quizId", quizId);
    try {
      await addQuestion(formData);
      formRef.current?.reset();
    } catch (error) {
      console.error(error);
      alert("Gagal menambahkan soal.");
    }
  };

  return (
    <form ref={formRef} action={actionHandler} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Tambah Pertanyaan Baru</h2>
      
      <div className="space-y-4">
        {/* Question Text */}
        <div className="space-y-1.5">
          <label htmlFor="question" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Teks Pertanyaan
          </label>
          <textarea
            id="question"
            name="question"
            rows={3}
            required
            placeholder="Masukkan pertanyaan di sini..."
            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 flex items-center gap-3">
            <span className="font-bold text-zinc-500 w-6">A.</span>
            <input type="text" name="optionA" required placeholder="Opsi A" className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100" />
          </div>
          <div className="space-y-1.5 flex items-center gap-3">
            <span className="font-bold text-zinc-500 w-6">B.</span>
            <input type="text" name="optionB" required placeholder="Opsi B" className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100" />
          </div>
          <div className="space-y-1.5 flex items-center gap-3">
            <span className="font-bold text-zinc-500 w-6">C.</span>
            <input type="text" name="optionC" required placeholder="Opsi C" className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100" />
          </div>
          <div className="space-y-1.5 flex items-center gap-3">
            <span className="font-bold text-zinc-500 w-6">D.</span>
            <input type="text" name="optionD" required placeholder="Opsi D" className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100" />
          </div>
        </div>

        {/* Meta Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-4">
          <div className="space-y-1.5">
            <label htmlFor="correctAnswer" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Jawaban Benar (Ketik Persis)
            </label>
            <input
              type="text"
              id="correctAnswer"
              name="correctAnswer"
              required
              placeholder="Copy paste teks opsi yang benar"
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100 border-l-4 border-l-emerald-500"
            />
            <p className="text-xs text-zinc-500">Teks harus cocok sama persis dengan salah satu opsi.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="difficulty" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tingkat Kesulitan (Adaptif)
            </label>
            <select
              id="difficulty"
              name="difficulty"
              required
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-zinc-900 dark:text-zinc-100"
              defaultValue="MEDIUM"
            >
              <option value="EASY">EASY (Mudah)</option>
              <option value="MEDIUM">MEDIUM (Sedang)</option>
              <option value="HARD">HARD (Sulit)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
