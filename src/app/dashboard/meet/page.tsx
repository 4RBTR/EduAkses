import { auth } from "@/auth";
import { getStudentClasses } from "@/app/actions/class";
import { redirect } from "next/navigation";
import { Video, ArrowRight, ShieldCheck, MonitorPlay } from "lucide-react";
import Link from "next/link";

export default async function StudentMeetPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const classes = await getStudentClasses();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-3">
          <Video className="w-8 h-8 text-primary" />
          Zoomeet (Video Conference)
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">
          Masuk ke ruang kelas virtual dan mulai sesi belajar interaktif bersama Pengajar.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-20 text-center shadow-sm">
           <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-zinc-400" />
           </div>
           <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Kelas</h3>
           <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
              Anda belum bergabung ke kelas mana pun. Silakan hubungi Pengajar untuk mendapatkan kode kelas.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map(cls => (
            <div key={cls.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <MonitorPlay className="w-6 h-6" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                     <ShieldCheck className="w-3 h-3" />
                     Enkripsi Aktif
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                    Ruang Kelas {cls.name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    Sesi video conference privat untuk anggota kelas.
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <Link 
                  href={`/dashboard/zoomeet/${cls.id}`}
                  className="inline-flex items-center justify-between w-full px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:gap-8 transition-all group/btn"
                >
                  Masuk Sekarang
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
