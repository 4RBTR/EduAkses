import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateQuizForm } from "@/app/dashboard/teacher/quizzes/_components/CreateQuizForm";
import { BrainCircuit, BookOpen, Settings2 } from "lucide-react";
import Link from "next/link";
import { DeleteQuizButton } from "@/app/dashboard/teacher/quizzes/_components/DeleteQuizButton";

export default async function TeacherQuizzesPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // Fetch classes taught by this teacher
  const taughtClasses = await prisma.classMember.findMany({
    where: { userId: session.user.id, role: "TEACHER" },
    include: { class: true }
  });

  const classOptions = taughtClasses.map(m => ({ id: m.class.id, name: m.class.name }));

  // Fetch quizzes created by this teacher
  const quizzes = await prisma.quiz.findMany({
    where: { creatorId: session.user.id },
    include: { 
      class: true,
      /* @ts-ignore - Prisma type sync delay */
      _count: {
        select: { questions: true, quizScores: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Manajemen Kuis
        </h1>
        <p className="text-zinc-500 mt-1">
          Buat kuis adaptif dan kelola bank soal untuk kelas Anda.
        </p>
      </div>

      <CreateQuizForm classes={classOptions} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Kuis Anda</h2>
        
        {quizzes.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center shadow-sm">
             <BrainCircuit className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
             <p className="text-zinc-500">Belum ada kuis yang dibuat.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <div key={quiz.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col h-full relative group">
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    {/* @ts-ignore */}
                    <span className="truncate">{quiz.class.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="bg-zinc-100 dark:bg-zinc-900 py-1.5 px-3 rounded-lg flex-1 text-center">
                      <div className="text-xs text-zinc-500">Total Soal</div>
                      {/* @ts-ignore */}
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{quiz._count.questions}</div>
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-900 py-1.5 px-3 rounded-lg flex-1 text-center">
                      <div className="text-xs text-zinc-500">Dikerjakan</div>
                      {/* @ts-ignore */}
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{quiz._count.quizScores}x</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <Link 
                    href={`/dashboard/teacher/quizzes/${quiz.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <Settings2 className="w-4 h-4" />
                    Kelola Soal
                  </Link>
                  <DeleteQuizButton quizId={quiz.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
