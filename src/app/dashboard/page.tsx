import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStudentClasses } from "@/app/actions/class";
import JoinClassModal from "@/components/dashboard/JoinClassModal";
import { 
  BookOpen, 
  GraduationCap, 
  ClipboardList, 
  Puzzle, 
  ChevronRight,
  ArrowRight,
  Compass,
  Star
} from "lucide-react";
import Link from "next/link";
import { DeleteNotificationButton } from "@/components/dashboard/DeleteNotificationButton";
import { DeleteScheduleButton } from "@/components/dashboard/DeleteScheduleButton";

export default async function StudentDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [classes, user] = await Promise.all([
    getStudentClasses(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { points: true }
    })
  ]);

  // Fetch upcoming assignments and schedules from all joined classes
  const classIds = classes.map(c => c.id);
  const [deadlines, schedules, notifications] = await Promise.all([
    prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        dueDate: { gte: new Date() }
      },
      include: { class: true },
      orderBy: { dueDate: "asc" },
      take: 3
    }),
    prisma.lessonSchedule.findMany({
      where: {
        classId: { in: classIds },
        dayOfWeek: new Date().getDay()
      },
      include: { class: true },
      orderBy: { startTime: "asc" }
    }),
    prisma.notification.findMany({
      where: { 
        classId: { in: classIds },
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      } as any,
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const canManageReminders = session.user.role === "CLASS_LEADER" || session.user.role === "TEACHER";

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pusat Belajar Siswa
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400 font-medium">
            Selamat datang kembali, <span className="text-primary">{session.user.name}</span>! Siap untuk tantangan hari ini?
          </p>
        </div>
        <JoinClassModal />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Kelas</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{classes.length}</p>
           </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Tugas</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                 {classes.reduce((acc, c) => acc + c._count.assignments, 0)}
              </p>
           </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Puzzle className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Kuis Tersedia</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                 {classes.reduce((acc, c) => acc + c._count.quizzes, 0)}
              </p>
           </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
           <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <Star className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Poin XP</p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user?.points.toLocaleString() || 0}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Joined Classes Section */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
             <Compass className="w-6 h-6 text-primary" />
             Kelas Saya
          </h2>

          {classes.length === 0 ? (
            <div className="p-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Belum ada kelas yang diikuti</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
                Gunakan kode undangan dari Guru Anda untuk bergabung ke dalam kelas dan mulai belajar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((cls) => (
                <Link 
                  href={`/dashboard/class/${cls.id}`} 
                  key={cls.id}
                  className="group relative bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                     <GraduationCap className="w-16 h-16 text-primary" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-primary transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-medium">
                     {cls.description || "Kelas EduAkses"}
                  </p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                       <ClipboardList className="w-3.5 h-3.5" />
                       {cls._count.assignments} Tugas
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
                       <Puzzle className="w-3.5 h-3.5" />
                       {cls._count.quizzes} Kuis
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                     <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                        <ChevronRight className="w-4 h-4" />
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Learning Activity Sidebar */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Papan Pengumuman
           </h2>
           <div className="space-y-4">
              {/* Today's Schedule */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                 <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                    Jadwal Hari Ini
                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                      {new Date().toLocaleDateString("id-ID", { weekday: 'long' })}
                    </span>
                 </h4>
                 <div className="space-y-3">
                    {schedules.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 italic">Tidak ada jadwal hari ini.</p>
                    ) : (
                      schedules.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 group/item">
                           <div className="w-1.5 h-8 bg-primary rounded-full"></div>
                           <div className="flex-1">
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{s.subject}</p>
                              <p className="text-[10px] text-zinc-500">{s.startTime} - {s.endTime} • {s.class.name}</p>
                           </div>
                           {session.user.role === "CLASS_LEADER" && <DeleteScheduleButton scheduleId={s.id} />}
                        </div>
                      ))
                    )}
                 </div>
              </div>

              {/* Reminders / Notifications */}
              <div className="p-5 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg space-y-4">
                 <p className="text-sm font-bold flex items-center gap-2">
                    <Star className="w-4 h-4 fill-white" />
                    Catatan Ketua Kelas
                 </p>
                 <div className="space-y-3">
                    {notifications.length === 0 ? (
                       <p className="text-xs opacity-70 italic">Belum ada pengumuman baru.</p>
                    ) : (
                       notifications.map((n) => (
                          <div key={n.id} className="pb-2 border-b border-white/10 last:border-0 flex items-start justify-between gap-2 group/msg">
                             <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold leading-tight truncate">{n.title}</p>
                                <p className="text-[10px] opacity-80 mt-1 line-clamp-2">{n.message}</p>
                             </div>
                             {canManageReminders && <DeleteNotificationButton notificationId={n.id} />}
                          </div>
                       ))
                    )}
                 </div>
              </div>

              {/* Deadlines */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                 <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Batas Waktu Terdekat</h4>
                 <div className="space-y-3">
                    {deadlines.length === 0 ? (
                      <p className="text-[10px] text-zinc-400 italic">Tidak ada tugas mendesak.</p>
                    ) : (
                      deadlines.map((d) => (
                        <Link 
                          href={`/dashboard/class/${d.classId}`} 
                          key={d.id} 
                          className="flex items-center border-l-4 border-red-500 pl-3 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                        >
                          <div className="flex-1">
                             <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{d.title}</p>
                             <p className="text-[10px] text-zinc-500">
                                {d.dueDate ? new Date(d.dueDate).toLocaleDateString("id-ID") : "-"}
                             </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-300" />
                        </Link>
                      ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

