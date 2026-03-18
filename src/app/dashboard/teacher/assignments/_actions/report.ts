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

  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { classId: true, title: true, dueDate: true }
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    const classMembers = await prisma.classMember.findMany({
      where: {
        classId: assignment.classId,
        role: { in: ["STUDENT", "CLASS_LEADER"] }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            submissions: {
              where: { assignmentId },
              select: {
                grade: true,
                createdAt: true,
                submissionStatus: true
              }
            }
          }
        }
      }
    });

    const report = classMembers.map(member => {
      const sub = member.user.submissions[0];
      let dStatus: "ON_TIME" | "LATE" | "LATE_APPROVED" | "BELUM_MENGERJAKAN" = 
        sub ? (sub.submissionStatus as "ON_TIME" | "LATE" | "LATE_APPROVED") : "BELUM_MENGERJAKAN";
      
      // If the submission is present but status is default 'ON_TIME', check dynamic dueDate.
      // (Or let Prisma enforce it, but this covers manual checking if it wasn't flagged).
      if (sub && sub.submissionStatus === "ON_TIME" && assignment.dueDate) {
        if (new Date(sub.createdAt) > new Date(assignment.dueDate)) {
          dStatus = "LATE";
        }
      }

      return {
        studentId: member.user.id,
        studentName: member.user.name,
        studentEmail: member.user.email,
        hasSubmitted: !!sub,
        submittedAt: sub ? sub.createdAt : null,
        grade: sub?.grade ?? null,
        submissionStatus: dStatus,
      };
    });

    return report;
  } catch (error) {
    console.error("Failed to generate assignment report:", error);
    throw new Error("Failed to generate report");
  }
}
