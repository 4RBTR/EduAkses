"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/app/actions/auth";
import { Loader2, ArrowRight, UserPlus, GraduationCap, Users } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      type="submit"
      className="group relative flex w-full justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 px-3 py-3 text-sm font-semibold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        {pending ? (
          <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
        ) : (
          <UserPlus className="h-5 w-5 text-zinc-500 group-hover:text-zinc-400 transition-colors" aria-hidden="true" />
        )}
      </span>
      {pending ? "Mendaftarkan..." : "Daftar Akun Baru"}
    </button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerUser, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex justify-center flex-col items-center">
             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                <GraduationCap className="w-7 h-7" />
             </div>
             <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
               EduAkses
             </h2>
          </div>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Bergabunglah dan mulai perjalanan belajar yang fokus.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          {state?.error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
              {state.error}
            </div>
          )}

          <div className="-space-y-px rounded-xl shadow-sm overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div>
              <label htmlFor="name" className="sr-only">Nama Lengkap</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="relative block w-full border-0 py-3 px-4 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-transparent placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-transparent"
                placeholder="Nama Lengkap"
              />
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-700">
              <label htmlFor="email-address" className="sr-only">Alamat Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full border-0 py-3 px-4 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-transparent placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-transparent"
                placeholder="Alamat Email"
              />
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-700">
              <label htmlFor="password" className="sr-only">Kata Sandi</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="relative block w-full border-0 py-3 px-4 text-zinc-900 dark:text-zinc-100 ring-1 ring-inset ring-transparent placeholder:text-zinc-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-transparent"
                placeholder="Kata Sandi (Min. 6 Karakter)"
              />
            </div>
          </div>

          <div className="space-y-2">
             <label htmlFor="role" className="block text-sm font-medium leading-6 text-zinc-900 dark:text-zinc-100">
                Pilih Peran Anda (Role)
             </label>
             <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-zinc-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  required
                  defaultValue="STUDENT"
                  className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 text-zinc-900 dark:text-zinc-100 shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-700 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white dark:bg-zinc-900"
                >
                  <option value="STUDENT">Siswa (Student)</option>
                  <option value="CLASS_LEADER">Ketua Kelas (Class Leader)</option>
                  <option value="TEACHER">Guru (Teacher)</option>
                </select>
             </div>
          </div>

          <div>
            <SubmitButton />
          </div>

          <div className="text-center mt-6 text-sm">
             <span className="text-zinc-500">Sudah punya akun? </span>
             <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1">
                Masuk di sini <ArrowRight className="w-3.5 h-3.5" />
             </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
