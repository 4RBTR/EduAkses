import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  Calendar, 
  Bell, 
  Users, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Video
} from "lucide-react";
import Link from "next/link";
import JoinClassModal from "@/components/dashboard/JoinClassModal";

export default async function LeaderDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== "CLASS_LEADER") {
    redirect("/login");
  }

  // Fetch class details for the leader
  const membership = await prisma.classMember.findFirst({
    where: { userId: session.user.id },
    include: { class: { include: { _count: { select: { members: true, assignments: true, quizzes: true } } } } }
  });

  const cls = membership?.class;

  if (!cls) {
    return (
      <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-pulse">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 italic">Selamat Datang, Ketua!</h1>
          <p className="text-zinc-500 mt-2 max-w-sm">
            Anda belum bergabung dengan kelas manapun. Silakan minta kode invite ke Guru Anda untuk mulai mengelola kelas.
          </p>
        </div>
        <JoinClassModal />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
             <ShieldCheck className="w-4 h-4" />
             Akses Ketua Kelas
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Pusat Komando {cls?.name || "Kelas"}
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Halo, <span className="font-semibold text-zinc-900 dark:text-zinc-100">{session.user.name}</span>! Kelola jadwal dan aktivitas kelas Anda di sini.
          </p>
        </div>
        <Link 
          href="/dashboard/leader/schedule" 
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
        >
          <Calendar className="w-5 h-5" />
          Kelola Jadwal
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Anggota Kelas</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{cls?._count.members || 0}</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
             <div className="w-[85%] h-full bg-blue-500 rounded-full"></div>
          </div>
        </div>

        <div className="group p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Reminder Dikirim</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">12</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
             <div className="w-[60%] h-full bg-purple-500 rounded-full"></div>
          </div>
        </div>

        <div className="group p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary/50 transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tugas & Kuis</p>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                {(cls?._count.assignments || 0) + (cls?._count.quizzes || 0)}
              </p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
             <div className="w-[45%] h-full bg-orange-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions and Features */}
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Pintasan Cepat</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/dashboard/leader/schedule"
                className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4 group hover:bg-zinc-50 transition-colors"
              >
                 <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Calendar className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Update Jadwal</h4>
                    <p className="text-[10px] text-zinc-500">Sesuaikan waktu pelajaran harian.</p>
                 </div>
                 <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/dashboard/leader/schedule"
                className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4 group hover:bg-zinc-50 transition-colors"
              >
                 <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <Bell className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Kirim Pengumuman</h4>
                    <p className="text-[10px] text-zinc-500">Berikan pengingat tugas ke anggota.</p>
                 </div>
                 <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/dashboard/leader/meet"
                className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-4 group hover:bg-zinc-50 transition-colors"
              >
                 <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                    <Video className="w-6 h-6" />
                 </div>
                 <div className="flex-1">
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Mulai Zoomeet</h4>
                    <p className="text-[10px] text-zinc-500">Diskusi kelas via video conference.</p>
                 </div>
                 <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-linear-to-br from-zinc-900 to-black rounded-3xl p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-bold">Tanggung Jawab Ketua Kelas</h3>
              <ul className="text-sm space-y-4 opacity-80">
                 <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    <span>Memastikan jadwal pelajaran selalu akurat dan terupdate.</span>
                 </li>
                 <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    <span>Mengirimkan pengingat untuk tugas-tugas yang mendekati deadline.</span>
                 </li>
                 <li className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></div>
                    <span>Menjadi jembatan komunikasi antara Guru dan Siswa.</span>
                 </li>
              </ul>
              <div className="pt-6">
                 <div className="p-4 bg-zinc-800/50 rounded-2xl border border-zinc-700">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status Keamanan</p>
                    <p className="text-xs text-green-400 flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4" />
                       Sistem Terenkripsi End-to-End
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

