import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReportsDashboard from "./_components/ReportsDashboard";
import { BarChart3 } from "lucide-react";

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // Fetch all classes for this teacher
  const classes = await prisma.class.findMany({
    where: { members: { some: { userId: session.user.id, role: "TEACHER" } } },
    include: {
      assignments: { select: { id: true, title: true, class: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      quizzes: { select: { id: true, title: true, class: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }
    }
  });

  const assignments = classes.flatMap(c => c.assignments.map((a: any) => ({ id: a.id, title: a.title, className: c.name })));
  const quizzes = classes.flatMap(c => c.quizzes.map((q: any) => ({ id: q.id, title: q.title, className: c.name })));

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
          <BarChart3 className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
            Laporan Kinerja Siswa
          </h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau dan unduh laporan performa siswa untuk seluruh tugas dan kuis dari kelas Anda.
          </p>
        </div>
      </div>
      
      <ReportsDashboard assignments={assignments} quizzes={quizzes} />
    </div>
  );
}
