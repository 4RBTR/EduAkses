"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function gradeSubmission(submissionId: string, grade: number, teacherComment?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak. Hanya Guru yang dapat menilai." };
  }

  try {
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        teacherComment,
        updatedAt: new Date()
      },
      include: {
        assignment: true
      }
    });

    revalidatePath(`/dashboard/teacher/class/${(submission as any).assignment.classId}/assignment/${submission.assignmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Grade submission error:", error);
    return { error: "Gagal menyimpan nilai." };
  }
}
