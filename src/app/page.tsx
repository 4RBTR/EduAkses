import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Globe, 
  ClipboardList, 
  Video, 
  LayoutDashboard,
  Users,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col selection:bg-primary/30 scroll-smooth">
      {/* Mesh Gradient Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-20 z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-500 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-purple-500 rounded-full blur-[110px]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-linear-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
              E
            </div>
            <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-white dark:via-zinc-300 dark:to-white">
              EduAkses
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <Link href="#features" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all hover:scale-105">Fitur</Link>
            <Link href="#about" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all hover:scale-105">Tentang</Link>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link 
                href="/dashboard"
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                Ke Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-black text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors pr-2">Masuk</Link>
                <Link 
                  href="/register"
                  className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 pt-40 pb-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary animate-in fade-in slide-in-from-top-6 duration-1000">
            <Sparkles className="w-4 h-4 fill-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next-Gen Learning Experience</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter max-w-5xl bg-clip-text text-transparent bg-linear-to-b from-zinc-900 via-zinc-800 to-zinc-400 dark:from-white dark:via-zinc-100 dark:to-zinc-600 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Belajar Tanpa Batas <br />
            <span className="text-primary italic">Mengajar Tanpa Ribet</span>
          </h1>

          <p className="max-w-3xl text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
            LMS terpadu yang didesain untuk menyatukan ekosistem sekolah. <br className="hidden md:block" />
            Simple, Powerful, dan Benar-benar Gratis.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            <Link 
              href="/register"
              className="group h-16 px-10 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl flex items-center justify-center gap-4 font-black text-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all"
            >
              Mulai Petualangan
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              href="/login"
              className="h-16 px-10 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-2 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-2xl flex items-center justify-center font-black text-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
            >
              Masuk Dashboard
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <section id="features" className="pt-32 max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">Eksplorasi Fitur Unggulan</h2>
            <p className="text-zinc-500 dark:text-zinc-500 font-bold">EduAkses menghadirkan pengalaman khusus untuk setiap pengguna.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {/* Teacher Feature */}
            <div className="group relative p-10 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="w-32 h-32 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-8">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Dashboard Pengajar</h3>
              <ul className="space-y-4">
                {[
                  "Kelola kelas & siswa secara terpusat",
                  "Buat kuis otomatis & manajemen tugas",
                  "Pantau statistik performa belajar",
                  "Integrasi Zoomeet instan"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Student Feature */}
            <div className="group relative p-10 bg-white dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-2xl hover:border-primary/50 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <GraduationCap className="w-32 h-32 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-8">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-4">Pusat Belajar Siswa</h3>
              <ul className="space-y-4">
                {[
                  "Kuis adaptif sesuai kemampuan",
                  "Manajemen tugas real-time",
                  "Sistem XP & Poin motivasi",
                  "Akses materi virtual kapan saja"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Leader Feature */}
            <div className="group relative p-10 bg-linear-to-br from-zinc-900 to-black rounded-[2.5rem] border border-zinc-800 shadow-2xl hover:border-primary/50 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <LayoutDashboard className="w-32 h-32 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-8">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Komando Ketua Kelas</h3>
              <ul className="space-y-4">
                {[
                  "Kelola jadwal pelajaran harian",
                  "Kirim reminder tugas otomatis",
                  "Mulai Zoomeet kelas",
                  "Jembatan komunikasi Guru-Siswa"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="pt-40 max-w-7xl mx-auto px-4 pb-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-primary to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-12 md:p-20 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] flex flex-col items-center text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter">Visi Kami</h2>
                <div className="h-1.5 w-24 bg-primary mx-auto rounded-full"></div>
              </div>
              
              <p className="max-w-4xl text-xl md:text-3xl font-bold italic text-zinc-600 dark:text-zinc-300 leading-relaxed">
                "Kami percaya bahwa teknologi seharusnya mempermudah pendidikan, bukan mempersulitnya. <br className="hidden md:block" />
                EduAkses hadir untuk mendemokratisasi akses LMS yang premium agar dapat dinikmati oleh setiap sekolah tanpa batasan biaya."
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                {[
                  { count: "100%", label: "Terintegrasi" },
                  { count: "0", label: "Biaya Alias $0" },
                  { count: "3+", label: "Peran Unik" },
                  { count: "Fast", label: "Performa Tinggi" }
                ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-3xl md:text-4xl font-black text-primary uppercase">{stat.count}</p>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200 dark:border-zinc-800 py-16 px-4 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center text-white dark:text-zinc-900 text-xs font-black">
                E
              </div>
              <span className="font-black text-xl">EduAkses LMS</span>
            </div>
            <p className="text-sm text-zinc-500 font-bold max-w-xs text-center md:text-left">
              Solusi manajemen pembelajaran cerdas untuk pendidikan masa depan.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8">
            {["Privasi", "Ketentuan", "Kontak", "Pusat Bantuan"].map((link, i) => (
              <Link key={i} href="#" className="text-sm font-bold text-zinc-500 hover:text-primary transition-colors">{link}</Link>
            ))}
          </div>

          <div className="text-center md:text-right space-y-2">
            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
              &copy; 2026 EduAkses Platform.
            </p>
            <p className="text-[10px] text-zinc-400 font-medium font-mono">
              Designed with &hearts; for educators globally.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
