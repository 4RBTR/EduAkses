"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAssignmentReport(assignmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 1. Get the assignment details to find its classId
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { classId: true, title: true }
  });

  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // 2. Fetch all students in the class
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

  // 3. Fetch submissions for this assignment
  const submissions = await prisma.submission.findMany({
    where: { assignmentId },
    include: {
      student: { select: { id: true } }
    }
  });

  // 4. Map them together to output
  // Result array with { user, submissionStatus, time, grade }
  
  const report = classMembers.map(member => {
    const sub = submissions.find(s => s.studentId === member.user.id);
    return {
      studentId: member.user.id,
      studentName: member.user.name,
      studentEmail: member.user.email,
      hasSubmitted: !!sub,
      submittedAt: sub ? sub.createdAt : null,
      grade: sub?.grade ?? null,
    };
  });

  return report;
}
