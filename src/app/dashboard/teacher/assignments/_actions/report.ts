"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function getAssignmentReport(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { classId: true, title: true }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const classMembers = await prisma.classMember.findMany({
    where: {
      classId: assignment.classId,
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

  // Use db (any-typed) to access new submissionStatus column
  const submissions = await db.submission.findMany({
    where: { assignmentId },
    select: {
      studentId: true,
      grade: true,
      createdAt: true,
      submissionStatus: true,
    }
  });

  const report = classMembers.map((member: any) => {
    const sub = submissions.find((s: any) => s.studentId === member.user.id);
    return {
      studentId: member.user.id,
      studentName: member.user.name,
      studentEmail: member.user.email,
      hasSubmitted: !!sub,
      submittedAt: sub ? sub.createdAt : null,
      grade: sub?.grade ?? null,
      submissionStatus: sub?.submissionStatus ?? null,
    };
  });

  return report;
}
