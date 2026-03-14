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

export async function postAnnouncement(classId: string, title: string, message: string, expiresAt?: Date) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "CLASS_LEADER" && session.user.role !== "TEACHER")) {
    return { error: "Hanya Ketua Kelas atau Guru yang dapat membuat pengumuman." };
  }

  try {
    await prisma.notification.create({
      data: {
        classId,
        title,
        message,
        expiresAt
      } as any
    });

    revalidatePath(`/dashboard/class/${classId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Post announcement error:", error);
    return { error: "Gagal membuat pengumuman." };
  }
}

export async function deleteNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Silakan login." };

  try {
    // Check if the user is TEACHER or CLASS_LEADER
    if (session.user.role !== "TEACHER" && session.user.role !== "CLASS_LEADER") {
       return { error: "Anda tidak memiliki akses untuk menghapus pengumuman." };
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete notification error:", error);
    return { error: "Gagal menghapus pengumuman." };
  }
}

export async function deleteSchedule(scheduleId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CLASS_LEADER") {
    return { error: "Hanya Ketua Kelas yang dapat menghapus jadwal." };
  }

  try {
    await prisma.lessonSchedule.delete({
      where: { id: scheduleId }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete schedule error:", error);
    return { error: "Gagal menghapus jadwal." };
  }
}
