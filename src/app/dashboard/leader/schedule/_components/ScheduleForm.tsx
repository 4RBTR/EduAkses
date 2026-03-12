"use client";

import { useFormStatus } from "react-dom";
import { createSchedule } from "@/app/actions/schedule";
import { CalendarPlus, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
      <span>{pending ? "Menyimpan..." : "Tambah Jadwal"}</span>
    </button>
  );
}

export function ScheduleForm() {
  return (
    <form action={createSchedule} className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Form Jadwal Baru
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="space-y-1">
          <label htmlFor="subject" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Mata Pelajaran
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            placeholder="Misal: Matematika"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="dayOfWeek" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Hari
          </label>
          <select
            id="dayOfWeek"
            name="dayOfWeek"
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            defaultValue="1"
          >
            <option value="1">Senin</option>
            <option value="2">Selasa</option>
            <option value="3">Rabu</option>
            <option value="4">Kamis</option>
            <option value="5">Jumat</option>
            <option value="6">Sabtu</option>
            <option value="0">Minggu</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="startTime" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Waktu Mulai
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="endTime" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Waktu Selesai
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
