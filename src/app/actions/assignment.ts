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
