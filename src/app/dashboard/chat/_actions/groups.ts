"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ── Create a new group ──
export async function createGroup(name: string, memberIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const group = await db.groupChat.create({
    data: {
      name,
      creatorId: session.user.id,
      members: {
        create: [
          { userId: session.user.id },
          ...memberIds.map((uid) => ({ userId: uid })),
        ],
      },
    },
  });

  revalidatePath("/dashboard/chat");
  return group;
}

// ── Get groups for current user ──
export async function getMyGroups() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const memberships = await db.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, avatar: true } } },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { name: true } } },
          },
        },
      },
    },
  });

  return memberships.map((m: any) => m.group);
}

// ── Get messages for a group ──
export async function getGroupMessages(groupId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const isMember = await db.groupMember.findFirst({
    where: { groupId, userId: session.user.id },
  });
  if (!isMember) throw new Error("Not a member");

  return db.groupMessage.findMany({
    where: { groupId },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

// ── Send a group message ──
export async function sendGroupMessage(
  groupId: string,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const message = await db.groupMessage.create({
    data: {
      content: content || null,
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || null,
      groupId,
      senderId: session.user.id,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Fetch group to get name and members
  const group = await db.groupChat.findUnique({
    where: { id: groupId },
    select: { name: true }
  });

  if (group) {
    const groupMembers = await db.groupMember.findMany({
      where: { groupId, userId: { not: session.user.id } },
      select: { userId: true }
    });

    if (groupMembers.length > 0) {
      const notifications = groupMembers.map((member: any) => ({
        title: `Pesan di Grup ${group.name}`,
        message: `${session.user.name}: ${content ? content.substring(0, 45) : "📎 Mengirim file"}`,
        type: "MESSAGE",
        link: `/dashboard/chat`,
        userId: member.userId,
      }));
      await db.userNotification.createMany({ data: notifications });
    }
  }

  revalidatePath("/dashboard/chat");
  return message;
}

// ── Search all contacts (for invite to group) ──
export async function searchUsersForGroup(query: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const myMemberships = await prisma.classMember.findMany({
    where: { userId: session.user.id },
    select: { classId: true },
  });
  const classIds = myMemberships.map((m) => m.classId);

  return prisma.user.findMany({
    where: {
      id: { not: session.user.id },
      name: { contains: query, mode: "insensitive" },
      memberships: { some: { classId: { in: classIds } } },
    },
    select: { id: true, name: true, email: true, role: true },
    take: 10,
  });
}
