"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getQuizAnalytics(quizId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { classId: true, title: true }
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const classMembers = await prisma.classMember.findMany({
    where: {
      classId: quiz.classId,
      role: "STUDENT"
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  const scores = await prisma.quizScore.findMany({
    where: { quizId }
  });

  const report = classMembers.map(member => {
    const scoreRow = scores.find(s => s.studentId === member.user.id);
    return {
      studentId: member.user.id,
      studentName: member.user.name,
      studentEmail: member.user.email,
      hasAttempted: !!scoreRow,
      score: scoreRow?.score ?? 0,
      correctAnswers: scoreRow?.correctAnswers ?? 0,
      incorrectAnswers: scoreRow?.incorrectAnswers ?? 0,
      completionPercentage: scoreRow?.completionPercentage ?? 0,
      attemptedAt: scoreRow ? scoreRow.createdAt : null,
    };
  });

  return report;
}
