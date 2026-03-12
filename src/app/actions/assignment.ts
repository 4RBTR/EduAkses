"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createAssignment(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const fileUrl = formData.get("fileUrl") as string; // Teacher can provide a link or file path
  const classId = formData.get("classId") as string;
  const dueDateStr = formData.get("dueDate") as string;

  if (!title || !classId) {
    return { error: "Judul dan Kelas wajib diisi." };
  }

  try {
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        fileUrl,
        classId,
        creatorId: session.user.id,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
      },
    });

    revalidatePath("/dashboard/teacher/assignments");
    return { success: true, assignmentId: assignment.id };
  } catch (error) {
    console.error("Create assignment error:", error);
    return { error: "Gagal membuat tugas." };
  }
}

export async function submitAssignment(assignmentId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Silakan login." };

  const content = formData.get("content") as string;
  const fileUrl = formData.get("fileUrl") as string;

  try {
    await prisma.submission.upsert({
      where: {
        studentId_assignmentId: {
          studentId: session.user.id,
          assignmentId
        }
      },
      update: {
        content,
        fileUrl,
        updatedAt: new Date()
      },
      create: {
        studentId: session.user.id,
        assignmentId,
        content,
        fileUrl
      }
    });

    // Award XP (e.g., 50 points for submission)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: 50 } }
    });

    revalidatePath(`/dashboard/class/${assignmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Submit assignment error:", error);
    return { error: "Gagal mengirimkan tugas." };
  }
}

export async function deleteAssignment(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.assignment.delete({
      where: { id },
    });
    revalidatePath("/dashboard/teacher/assignments");
    return { success: true };
  } catch (error) {
    console.error("Delete assignment error:", error);
    throw new Error("Failed to delete assignment");
  }
}

export async function getTeacherAssignments() {
  const session = await auth();
  if (!session?.user) return [];

  return await prisma.assignment.findMany({
    where: {
      class: {
        members: {
          some: {
            userId: session.user.id,
            role: "TEACHER",
          },
        },
      },
    },
    include: {
      class: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function gradeSubmission(submissionId: string, grade: number, teacherComment?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak. Hanya guru yang dapat menilai." };
  }

  try {
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        teacherComment,
      },
    });

    revalidatePath(`/dashboard/teacher/class/${submission.assignmentId}/assignment/${submission.assignmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Grade submission error:", error);
    return { error: "Gagal memberikan nilai." };
  }
}
