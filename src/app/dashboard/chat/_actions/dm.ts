"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ── Get all users who share a class with current user (contacts for DM) ──
export async function getDMContacts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const myId = session.user.id;

  const myMemberships = await prisma.classMember.findMany({
    where: { userId: myId },
    select: { classId: true },
  });
  const classIds = myMemberships.map((m) => m.classId);

  const members = await prisma.classMember.findMany({
    where: {
      classId: { in: classIds },
      userId: { not: myId },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, avatar: true },
      },
    },
  });

  const userMap = new Map<string, (typeof members)[0]["user"]>();
  for (const m of members) {
    if (!userMap.has(m.user.id)) userMap.set(m.user.id, m.user);
  }

  return Array.from(userMap.values());
}

// ── Get DM messages between current user and a partner ──
export async function getDMs(partnerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = prisma as any;

  const messages = await client.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: partnerId },
        { senderId: partnerId, receiverId: session.user.id },
      ],
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Mark incoming messages as read
  await client.directMessage.updateMany({
    where: {
      senderId: partnerId,
      receiverId: session.user.id,
      isRead: false,
    },
    data: { isRead: true },
  });

  return messages;
}

// ── Send a DM ──
export async function sendDM(
  receiverId: string,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = prisma as any;

  const message = await client.directMessage.create({
    data: {
      content: content || null,
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || null,
      senderId: session.user.id,
      receiverId,
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } },
    },
  });

  // Create notification for receiver
  await client.userNotification.create({
    data: {
      title: `Pesan baru dari ${session.user.name}`,
      message: content ? content.substring(0, 60) : "📎 Mengirim file",
      type: "MESSAGE",
      link: `/dashboard/chat`,
      userId: receiverId,
    },
  });

  revalidatePath("/dashboard/chat");
  return message;
}

// ── Get unread DM count for current user ──
export async function getUnreadDMCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (prisma as any).directMessage.count({
    where: { receiverId: session.user.id, isRead: false },
  });
}
