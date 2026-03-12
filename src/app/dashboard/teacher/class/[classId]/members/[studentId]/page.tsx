import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { 
  ArrowLeft, 
  GraduationCap, 
  Star, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Puzzle,
  TrendingUp,
  Award,
  ClipboardList
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    classId: string;
    studentId: string;
  }>;
}

export default async function StudentDetailPage(props: PageProps) {
  const params = await props.params;
  const { classId, studentId } = params;

  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  const [student, cls, assignments, submissions, quizScores] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId } }),
    prisma.class.findUnique({ where: { id: classId } }),
    prisma.assignment.findMany({ where: { classId }, orderBy: { createdAt: "desc" } }),
    prisma.submission.findMany({ where: { studentId, assignmentId: { in: (await prisma.assignment.findMany({ where: { classId }, select: { id: true } })).map(a => a.id) } } }),
    prisma.quizScore.findMany({ where: { studentId, quizId: { in: (await prisma.quiz.findMany({ where: { classId }, select: { id: true } })).map(q => q.id) } }, include: { quiz: true } })
  ]);

  if (!student || !cls) notFound();

  // Calculate Stats
  const finishedAssignments = submissions.filter(s => s.grade !== null).length;
  const pendingAssignments = assignments.length - submissions.length;
  const averageQuizScore = quizScores.length > 0 
    ? (quizScores.reduce((acc, s) => acc + s.score, 0) / quizScores.length).toFixed(1) 
    : "N/A";

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-4">
        <Link 
          href={`/dashboard/class/${classId}/members`}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Anggota
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary/10 to-indigo-500/10 flex items-center justify-center font-black text-3xl text-primary border border-primary/20 shadow-lg">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                 <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight italic uppercase">
                   {student.name}
                 </h1>
                 <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-wider border border-emerald-200 dark:border-emerald-800">
                    Siswa Aktif
                 </span>
              </div>
              <p className="text-zinc-500 font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                {student.points.toLocaleString()} XP Terakumulasi
              </p>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center min-w-[120px]">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Rata-rata Kuis</p>
                <p className="text-xl font-black text-primary">{averageQuizScore}</p>
             </div>
             <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-center min-w-[120px]">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Tugas Selesai</p>
                <p className="text-xl font-black text-emerald-600">{finishedAssignments}/{assignments.length}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assignment Progress */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                 <ClipboardList className="w-6 h-6 text-primary" />
                 Riwayat Pengumpulan Tugas
              </h2>
           </div>

           <div className="space-y-4">
              {assignments.map(a => {
                const submission = submissions.find(s => s.assignmentId === a.id);
                return (
                  <div key={a.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                       <div className={cn(
                         "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                         submission ? "bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20" : "bg-red-50 text-red-500 dark:bg-red-900/20"
                       )}>
                          {submission ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                       </div>
                       <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{a.title}</p>
                          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                            {submission ? `Dinilai: ${submission.grade || '---'}` : "Belum Submit"}
                          </p>
                       </div>
                    </div>
                    {submission && (
                       <Link 
                        href={`/dashboard/teacher/class/${classId}/assignment/${a.id}`}
                        className="px-4 py-2 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                       >
                         Buka Review
                       </Link>
                    )}
                  </div>
                )
              })}
           </div>
        </div>

        {/* Quiz Performance */}
        <div className="space-y-6">
           <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Puzzle className="w-6 h-6 text-indigo-500" />
              Performa Kuis
           </h2>
           <div className="space-y-3">
              {quizScores.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center text-xs text-zinc-400 italic">
                   Belum ada data kuis untuk siswa ini.
                </div>
              ) : (
                quizScores.map(score => (
                  <div key={score.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                     <div className="space-y-0.5">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{score.quiz.title}</p>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{new Date(score.createdAt).toLocaleDateString("id-ID")}</p>
                     </div>
                     <div className="text-xl font-black text-indigo-500">{score.score}</div>
                  </div>
                ))
              )}
           </div>

           {/* Performance Insight */}
           <div className="p-6 bg-linear-to-br from-zinc-900 to-primary rounded-3xl text-white shadow-xl relative overflow-hidden">
              <TrendingUp className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10" />
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                 <Award className="w-5 h-5 text-yellow-400" />
                 Analisis Belajar
              </h3>
              <div className="space-y-3 opacity-90 text-xs leading-relaxed">
                 <p>Siswa menunjukkan konsistensi dalam {finishedAssignments > assignments.length / 2 ? "penyelesaian tugas tepat waktu" : "mengerjakan kuis"}.</p>
                 <div className="pt-2">
                    <p className="font-black uppercase tracking-widest text-[10px] text-yellow-400">Rekomendasi:</p>
                    <p className="mt-1">Berikan tugas tambahan berbasis kuis untuk meningkatkan pemahaman konseptual.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
