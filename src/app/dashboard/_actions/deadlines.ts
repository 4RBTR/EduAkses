"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type UrgentDeadline = {
  id: string;
  title: string;
  dueDate: Date;
  classId: string;
  className: string;
};

/**
 * Returns assignments for the current user's classes that:
 *  1. Have a dueDate within the next 24 hours (but still in the future)
 *  2. The user has NOT yet submitted
 */
export async function getUrgentDeadlines(): Promise<UrgentDeadline[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Get all class IDs the user belongs to
  const memberships = await prisma.classMember.findMany({
    where: { userId: session.user.id },
    select: { classId: true },
  });
  const classIds = memberships.map((m) => m.classId);
  if (classIds.length === 0) return [];

  // Find assignments in those classes with upcoming deadline
  const assignments = await prisma.assignment.findMany({
    where: {
      classId: { in: classIds },
      dueDate: {
        gte: now,
        lte: in24h,
      },
      // Exclude assignments already submitted by this user
      submissions: {
        none: {
          studentId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      classId: true,
      class: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return assignments.map((a) => ({
    id: a.id,
    title: a.title,
    dueDate: a.dueDate!,
    classId: a.classId,
    className: a.class.name,
  }));
}
