import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AddQuestionForm } from "./_components/AddQuestionForm";
import { DeleteQuestionButton } from "./_components/DeleteQuestionButton";
import { ArrowLeft, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function ManageQuestionsPage(props: PageProps) {
  const params = await props.params;
  const { quizId } = params;

  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // Verify ownership
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      class: true,
      questions: { orderBy: { id: "asc" } } // Simplified ordering
    }
  });

  if (!quiz || quiz.creatorId !== session.user.id) {
    redirect("/dashboard/teacher/quizzes");
  }

  return (
    <div className="space-y-8">
      <div>
        <Link 
          href="/dashboard/teacher/quizzes"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar Kuis
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Kelola Soal Kuis
        </h1>
        <p className="text-zinc-500 mt-1">
          Kuis: <strong className="text-zinc-700 dark:text-zinc-300">{quiz.title}</strong> — Kelas: {quiz.class.name}
        </p>
      </div>

      <AddQuestionForm quizId={quiz.id} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          Bank Soal ({quiz.questions.length})
        </h2>
        
        {quiz.questions.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center shadow-sm">
             <p className="text-zinc-500">Belum ada soal pada kuis ini. Silahkan tambahkan di atas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {quiz.questions.map((q, idx) => {
              // Extract options for display safely
              const options = q.options as string[];
              
              const difficultyColors = {
                EASY: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
                MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
                HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
              };

              const diffColor = difficultyColors[q.difficulty as "EASY"|"MEDIUM"|"HARD"] || difficultyColors.MEDIUM;

              return (
                <div key={q.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm relative pr-16">
                   
                   <div className="absolute top-5 right-5">
                      <DeleteQuestionButton questionId={q.id} />
                   </div>

                   <div className="flex items-start gap-4 mb-4">
                     <span className="shrink-0 w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-zinc-500 text-sm">
                       {idx + 1}
                     </span>
                     <div>
                       <div className={cn("inline-flex px-2 py-0.5 rounded text-xs font-semibold border mb-2", diffColor)}>
                          {q.difficulty}
                       </div>
                       <p className="text-zinc-800 dark:text-zinc-200 font-medium">{q.question}</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-12">
                     {options.map((opt, oIdx) => (
                       <div 
                         key={oIdx} 
                         className={cn(
                           "px-3 py-2 rounded-lg border text-sm flex gap-2 items-center",
                           opt === q.correctAnswer 
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium" 
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                         )}
                       >
                         <span className="font-bold opacity-50">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                       </div>
                     ))}
                   </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
