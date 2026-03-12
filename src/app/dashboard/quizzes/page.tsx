import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BrainCircuit, BookOpen, Star, PlayCircle, Trophy } from "lucide-react";
import Link from "next/link";

export default async function StudentQuizzesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch quizzes from joined classes
  const quizzes = await prisma.quiz.findMany({
    where: {
      class: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    },
    include: {
      class: true,
      _count: {
        select: { questions: true }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Fetch student scores for these quizzes to show completion
  const scores = await prisma.quizScore.findMany({
    where: { studentId: session.user.id }
  });

  const scoreMap = new Map(scores.map(s => [s.quizId, s.score]));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Kuis Adaptif
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">
            Uji pemahaman Anda dengan tantangan yang menyesuaikan level kemampuan Anda.
          </p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-20 text-center shadow-sm">
           <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="w-10 h-10 text-primary" />
           </div>
           <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Kuis Belum Tersedia</h3>
           <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
              Sepertinya belum ada kuis yang diterbitkan di kelas yang Anda ikuti. Cek kembali nanti!
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quizzes.map(quiz => {
            const userScore = scoreMap.get(quiz.id);
            const isCompleted = userScore !== undefined;

            return (
              <div key={quiz.id} className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {quiz.class.name}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        <Trophy className="w-3 h-3" />
                        Selesai
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-primary transition-colors">
                    {quiz.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 font-medium text-zinc-500">
                      <BookOpen className="w-4 h-4" />
                      {quiz._count.questions} Soal
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-purple-500">
                      <Star className="w-4 h-4" />
                      {isCompleted ? `Skor: ${userScore}` : "Adaptif"}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                  <Link 
                    href={`/dashboard/quizzes/${quiz.id}`}
                    className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      isCompleted 
                      ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700" 
                      : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    }`}
                  >
                    <PlayCircle className="w-4 h-4" />
                    {isCompleted ? "Ulangi Kuis" : "Mulai Sekarang"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
