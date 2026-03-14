import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeacherClasses } from "@/app/actions/class";
import CreateClassForm from "@/components/dashboard/CreateClassForm";
import { 
  Plus,
  Users, 
  BookOpen, 
  Clock, 
  ArrowRight, 
  ChevronRight,
  ClipboardList,
  GraduationCap,
  MonitorPlay
} from "lucide-react";
import Link from "next/link";

export default async function TeacherDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  const classes = await getTeacherClasses();

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pusat Kendali Pengajar
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Halo, <span className="font-semibold text-zinc-900 dark:text-zinc-100">{session.user.name}</span>! Apa rencana belajar hari ini?
          </p>
        </div>
        <CreateClassForm />
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-zinc-500">Total Siswa</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {classes.reduce((acc, c) => acc + c._count.members, 0)}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-zinc-500">Tugas Aktif</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
             {classes.reduce((acc, c) => acc + c._count.assignments, 0)}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-zinc-500">Kuis Selesai</span>
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
             {classes.reduce((acc, c) => acc + c._count.quizzes, 0)}
          </div>
        </div>
        <Link 
          href="/dashboard/meet"
          className="p-6 bg-linear-to-br from-indigo-600 to-violet-700 rounded-2xl border border-indigo-500/20 shadow-lg group hover:scale-[1.02] transition-all"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-white/20 text-white rounded-lg group-hover:bg-white/30 transition-colors">
              <MonitorPlay className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-white/80 uppercase tracking-widest">Zoomeet</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-white">Video Conference</div>
            <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Class List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-zinc-400" />
              Kelas Saya
            </h2>
            <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full text-zinc-500">
              {classes.length} Kelas
            </span>
          </div>

          {classes.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Belum ada kelas</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mt-1">
                Mulailah dengan membuat kelas baru untuk mengelola siswa dan tugas Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {classes.map((cls) => (
                <Link 
                  href={`/dashboard/class/${cls.id}`} 
                  key={cls.id}
                  className="group relative bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded">
                       Code: {cls.inviteCode}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-primary transition-colors">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-6">
                    {cls.description || "Tidak ada deskripsi."}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {cls._count.members}
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="w-3.5 h-3.5" />
                        {cls._count.assignments}
                      </span>
                    </div>
                    <div className="p-1 px-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-all text-primary border border-primary/20 flex items-center gap-1 text-[10px] font-bold">
                       DETAIL <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Info/Recent Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-400" />
            Aktivitas Terakhir
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 shadow-sm">
             <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Jadwal diperbarui</p>
                   <p className="text-xs text-zinc-500">Baru saja</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
             </div>
             <div className="flex items-center gap-4 group cursor-pointer opacity-50">
                <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                <div className="flex-1">
                   <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Kuis Matematika Selesai</p>
                   <p className="text-xs text-zinc-500">2 jam yang lalu</p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-300 transition-transform" />
             </div>
          </div>
          
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
             <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                Tips Fokus
             </h4>
             <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Gunakan fitur "Focus Mode" saat mengadakan Video Conference untuk meminimalisir gangguan selama sesi belajar berlangsung.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

