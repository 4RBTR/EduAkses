"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export async function getNotes() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.workspaceNote.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    select: { 
      id: true, 
      title: true, 
      icon: true, 
      coverUrl: true, 
      isPinned: true, 
      updatedAt: true,
      stage: true,
      role: true,
      activityType: true,
      startDate: true,
      deadline: true,
      picId: true,
      pic: { select: { name: true, avatar: true } }
    },
  });
}

export async function getNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.workspaceNote.findFirst({
    where: { id, userId: session.user.id },
  });
}

export async function createNote() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const note = await db.workspaceNote.create({
    data: { userId: session.user.id, title: "Untitled", icon: "📝" },
  });

  revalidatePath("/dashboard/workspace");
  return note;
}

export async function updateNote(
  id: string,
  data: { 
    title?: string; 
    content?: string; 
    coverUrl?: string | null; 
    icon?: string; 
    isPinned?: boolean;
    stage?: string;
    role?: string;
    activityType?: string;
    startDate?: Date | null;
    deadline?: Date | null;
    picId?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.workspaceNote.updateMany({
    where: { id, userId: session.user.id },
    data,
  });

  // PERFORMANCE: Only revalidate if structural fields change.
  // Content changes don't need a full path revalidation (autosave friendly).
  const isStructural = data.title !== undefined || 
                       data.icon !== undefined || 
                       data.isPinned !== undefined ||
                       data.stage !== undefined ||
                       data.picId !== undefined;

  if (isStructural) {
    revalidatePath("/dashboard/workspace");
  }
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.workspaceNote.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/dashboard/workspace");
}
