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

  // Fetch all classes where the user is a member (specifically as leader or joined as member)
  const memberships = await prisma.classMember.findMany({
    where: { userId: session.user.id },
    include: { 
      class: { 
        include: { 
          _count: { 
            select: { 
              members: true, 
              assignments: true, 
              quizzes: true 
            } 
          } 
        } 
      } 
    },
    orderBy: { joinedAt: "desc" }
  });

  const classes = memberships.map(m => m.class);

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
            Pusat Komando
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400 font-medium">
            Halo, <span className="text-zinc-900 dark:text-zinc-100">{session.user.name}</span>! Kelola semua kelas komando Anda di sini.
          </p>
        </div>
        <JoinClassModal />
      </div>

      {classes.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center space-y-6 bg-white dark:bg-zinc-950 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 p-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 italic">Siap Bertugas, Ketua?</h3>
            <p className="text-zinc-500 mt-2 max-w-sm">
              Anda belum bergabung dengan kelas manapun. Masukkan kode invite untuk mulai mengelola kelas.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Summary (Aggregated) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Kelas</p>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{classes.length}</p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Anggota</p>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                {classes.reduce((acc, c) => acc + c._count.members, 0)}
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Aktivitas</p>
              <p className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
                {classes.reduce((acc, c) => acc + (c._count.assignments + c._count.quizzes), 0)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List of Managed Classes */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                 <ShieldCheck className="w-6 h-6 text-primary" />
                 Kelas di Bawah Komando
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map((cls) => (
                  <Link 
                    href={`/dashboard/class/${cls.id}`} 
                    key={cls.id}
                    className="group relative bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-2xl transition-all"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <ShieldCheck className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">{cls.name}</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
                       <div className="flex items-center gap-1.5"><Users className="w-3 h-3" /> {cls._count.members} Anggota</div>
                       <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {cls._count.assignments + cls._count.quizzes} Aktivitas</div>
                    </div>
                    <div className="mt-6 flex justify-end">
                       <div className="h-9 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold group-hover:bg-primary group-hover:text-white transition-all">
                          Masuk Panel Komando <ArrowRight className="w-3.5 h-3.5 ml-2" />
                       </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Support Info Sidebar */}
            <div className="space-y-6">
               <div className="bg-zinc-950 dark:bg-zinc-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <h3 className="text-xl font-bold relative z-10">Tanggung Jawab Ketua</h3>
                  <div className="space-y-4 relative z-10 opacity-80 text-sm">
                     <p>Sebagai Ketua Kelas, Anda memiliki wewenang untuk:</p>
                     <ul className="space-y-2">
                        <li className="flex items-center gap-2">• Mengatur Jadwal Pelajaran</li>
                        <li className="flex items-center gap-2">• Mengirimkan Reminder Tugas</li>
                        <li className="flex items-center gap-2">• Memulai Zoomeet Kelas</li>
                     </ul>
                  </div>
               </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

