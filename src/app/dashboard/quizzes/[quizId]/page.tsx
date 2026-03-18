import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { QuizEngine } from "./_components/QuizEngine";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    quizId: string;
  }>;
}

export default async function AdaptiveQuizPage(props: PageProps) {
  const params = await props.params;
  const { quizId } = params;

  const session = await auth();
  if (!session?.user?.id || (session.user.role !== "STUDENT" && session.user.role !== "CLASS_LEADER")) {
    redirect("/dashboard");
  }

  // Fetch Quiz and verify it belongs to a class student is enrolled in
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { class: true }
  });

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-zinc-400 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Kuis Tidak Ditemukan</h2>
        <Link href="/dashboard" className="text-primary hover:underline font-medium">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  // Verify membership
  const member = await prisma.classMember.findUnique({
    where: {
      userId_classId: {
        userId: session.user.id,
        classId: quiz.classId
      }
    }
  });

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Akses Ditolak</h2>
        <p className="text-zinc-500">Anda tidak terdaftar di kelas untuk mengikuti kuis ini.</p>
      </div>
    );
  }

  // Ensure there are questions
  const questionCount = await prisma.quizQuestion.count({ where: { quizId } });
  if (questionCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <h2 className="text-xl font-medium text-zinc-600 dark:text-zinc-400">Guru belum menambahkan soal untuk kuis ini.</h2>
      </div>
    );
  }

  return (
    <div className="w-full">
      <QuizEngine quizId={quiz.id} quizTitle={quiz.title} />
    </div>
  );
}
