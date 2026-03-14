import { getCalendarEvents } from "@/app/actions/calendar";
import Calendar from "@/components/dashboard/Calendar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CalendarDays, Sparkles } from "lucide-react";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { fixedEvents, recurringEvents } = await getCalendarEvents() as any;

  return (
    <div className="space-y-8 p-2 md:p-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest animate-pulse">
            <Sparkles className="w-4 h-4 fill-primary" />
            Integrasi EduAkses
          </div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Kalender Belajar
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">
            Pantau semua tugas, jadwal, dan pengumuman dalam satu tampilan.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-2 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
           <div className="flex -space-x-3 overflow-hidden p-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full ring-4 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs">
                  {i === 3 ? "+" : "S"}
                </div>
              ))}
           </div>
           <div className="pr-4 border-r border-zinc-100 dark:border-zinc-800">
             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter leading-none">Status</p>
             <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">Live Sync</p>
           </div>
           <div className="pl-2 pr-4">
             <CalendarDays className="w-6 h-6 text-primary" />
           </div>
        </div>
      </div>

      {/* Main Calendar View */}
      <div className="relative">
         {/* Decorative elements */}
         <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10"></div>
         <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
         
         <Calendar 
            fixedEvents={fixedEvents} 
            recurringEvents={recurringEvents} 
         />
      </div>

      {/* Quick Legend / Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
            <div>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">Deadline Tugas</p>
              <p className="text-[10px] text-zinc-500">Batas akhir pengumpulan</p>
            </div>
          </div>
        </div>
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-primary shadow-lg shadow-primary/20"></div>
            <div>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">Jadwal Pelajaran</p>
              <p className="text-[10px] text-zinc-500">Pertemuan rutin mingguan</p>
            </div>
          </div>
        </div>
        <div className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20"></div>
            <div>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-100">Reminder</p>
              <p className="text-[10px] text-zinc-500">Pesan dari Ketua Kelas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
