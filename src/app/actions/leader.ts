"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function manageSchedule(classId: string, subject: string, dayOfWeek: number, startTime: string, endTime: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLASS_LEADER") {
    return { error: "Hanya Ketua Kelas yang dapat mengatur jadwal." };
  }

  try {
    await prisma.lessonSchedule.create({
      data: {
        classId,
        subject,
        dayOfWeek,
        startTime,
        endTime
      }
    });

    revalidatePath(`/dashboard/class/${classId}`);
    return { success: true };
  } catch (error) {
    console.error("Manage schedule error:", error);
    return { error: "Gagal menyimpan jadwal." };
  }
}

export async function postAnnouncement(classId: string, title: string, message: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLASS_LEADER") {
    return { error: "Hanya Ketua Kelas yang dapat membuat pengumuman." };
  }

  try {
    await prisma.notification.create({
      data: {
        classId,
        title,
        message
      }
    });

    revalidatePath(`/dashboard/class/${classId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Post announcement error:", error);
    return { error: "Gagal membuat pengumuman." };
  }
}
