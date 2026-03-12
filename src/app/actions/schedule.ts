"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/** Helper to get current user's class where they are a CLASS_LEADER */
async function getLeaderClassId(userId: string) {
  const member = await prisma.classMember.findFirst({
    where: { userId, role: "CLASS_LEADER" },
    select: { classId: true }
  });
  return member?.classId;
}

export async function createSchedule(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CLASS_LEADER") {
    throw new Error("Unauthorized");
  }

  const classId = await getLeaderClassId(session.user.id);
  if (!classId) throw new Error("Class not found for this leader");

  const subject = formData.get("subject") as string;
  const dayOfWeek = parseInt(formData.get("dayOfWeek") as string, 10);
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;

  if (!subject || isNaN(dayOfWeek) || !startTime || !endTime) {
    throw new Error("Invalid form data");
  }

  await prisma.lessonSchedule.create({
    data: {
      subject,
      dayOfWeek,
      startTime,
      endTime,
      classId,
    }
  });

  revalidatePath("/dashboard/leader/schedule");
}

export async function deleteSchedule(id: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CLASS_LEADER") {
    throw new Error("Unauthorized");
  }

  const classId = await getLeaderClassId(session.user.id);
  if (!classId) throw new Error("Class not found for this leader");

  // Verify schedule belongs to the class
  const schedule = await prisma.lessonSchedule.findUnique({ where: { id } });
  if (schedule?.classId !== classId) throw new Error("Unauthorized");

  await prisma.lessonSchedule.delete({ where: { id } });
  revalidatePath("/dashboard/leader/schedule");
}

export async function sendReminder(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "CLASS_LEADER") {
    throw new Error("Unauthorized");
  }

  const classId = await getLeaderClassId(session.user.id);
  if (!classId) throw new Error("Class not found for this leader");

  // Verify assignment belongs to the class
  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || assignment.classId !== classId) {
    throw new Error("Assignment not found or unauthorized");
  }

  // Create notification for the class
  await prisma.notification.create({
    data: {
      title: "Reminder: Tugas Mendekati Deadline!",
      message: `Jangan lupa kerjakan tugas "${assignment.title}". Deadline: ${assignment.dueDate?.toLocaleDateString("id-ID") || "Tidak ada detail"}.`,
      classId,
    }
  });

  revalidatePath("/dashboard/leader/schedule");
}
