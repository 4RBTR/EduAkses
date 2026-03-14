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

export async function updateAssignment(assignmentId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak." };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const fileUrl = formData.get("fileUrl") as string;
  const dueDateStr = formData.get("dueDate") as string;

  if (!title) return { error: "Judul wajib diisi." };

  try {
    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        title,
        description,
        fileUrl,
        dueDate: dueDateStr ? new Date(dueDateStr) : null,
      },
    });

    revalidatePath("/dashboard/teacher/assignments");
    revalidatePath(`/dashboard/class/${assignmentId}`); // Revalidate student view
    return { success: true };
  } catch (error) {
    console.error("Update assignment error:", error);
    return { error: "Gagal memperbarui tugas." };
  }
}

export async function submitAssignment(assignmentId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Silakan login." };

  const content = formData.get("content") as string;
  const fileUrl = formData.get("fileUrl") as string;

  try {
    // 1. Check Deadline
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        extensions: {
          where: { studentId: session.user.id, status: "APPROVED" }
        }
      }
    });

    if (!assignment) return { error: "Tugas tidak ditemukan." };

    const isPastDeadline = assignment.dueDate && new Date() > assignment.dueDate;
    const hasApprovedExtension = assignment.extensions.length > 0;

    if (isPastDeadline && !hasApprovedExtension) {
      return { error: "Batas waktu pengumpulan telah berakhir. Silakan minta dispensasi ke guru." };
    }

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

    // Award XP (e.g., 50 points for submission, 25 for late)
    const pointsToAward = isPastDeadline ? 25 : 50;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { points: { increment: pointsToAward } }
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

export async function requestExtension(assignmentId: string, reason: string) {
  const session = await auth();
  if (!session?.user) return { error: "Silakan login." };

  try {
    await prisma.assignmentExtension.upsert({
      where: {
        studentId_assignmentId: {
          studentId: session.user.id,
          assignmentId
        }
      },
      update: {
        reason,
        status: "PENDING",
        updatedAt: new Date()
      },
      create: {
        studentId: session.user.id,
        assignmentId,
        reason
      }
    });

    revalidatePath(`/dashboard/class/${assignmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Request extension error:", error);
    return { error: "Gagal mengirim permintaan dispensasi." };
  }
}

export async function manageExtension(extensionId: string, status: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Akses ditolak." };
  }

  try {
    const extension = await prisma.assignmentExtension.update({
      where: { id: extensionId },
      data: { status }
    });

    revalidatePath(`/dashboard/teacher/assignments`);
    return { success: true };
  } catch (error) {
    console.error("Manage extension error:", error);
    return { error: "Gagal memperbarui status dispensasi." };
  }
}
