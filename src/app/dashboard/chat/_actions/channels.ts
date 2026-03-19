"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ── Get all channels for a class ──
export async function getClassChannels(classId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  // Only members of the class can see channels
  const membership = await prisma.classMember.findFirst({
    where: { userId: session.user.id, classId },
  });
  if (!membership) return [];

  return db.class_channels.findMany({
    where: { classId },
    orderBy: { createdAt: "asc" },
  });
}

// ── Get messages for a channel ──
export async function getChannelMessages(channelId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const messages = await db.channel_messages.findMany({
    where: { channelId },
    include: {
      users: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return messages.map((m: any) => ({
    ...m,
    sender: m.users,
    users: undefined,
  }));
}

// ── Send a message to a channel ──
export async function sendChannelMessage(
  channelId: string,
  content: string,
  attachmentUrl?: string,
  attachmentType?: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const message = await db.channel_messages.create({
    data: {
      content: content || null,
      attachmentUrl: attachmentUrl || null,
      attachmentType: attachmentType || null,
      channelId,
      senderId: session.user.id,
    },
    include: {
      users: { select: { id: true, name: true, avatar: true } },
    },
  });

  revalidatePath("/dashboard/chat");
  
  return {
    ...message,
    sender: message.users,
    users: undefined,
  };
}

// ── Create a class channel (teacher/leader only) ──
export async function createClassChannel(classId: string, name: string, description?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const membership = await prisma.classMember.findFirst({
    where: { userId: session.user.id, classId },
  });
  if (!membership || membership.role === "STUDENT") throw new Error("Forbidden");

  const channel = await db.class_channels.create({
    data: {
      name: name.toLowerCase().replace(/\s+/g, "-"),
      description: description || null,
      classId,
      createdBy: session.user.id,
    },
  });

  revalidatePath("/dashboard/chat");
  return channel;
}

// ── Bootstrap default channel for a class (called once) ──
export async function ensureDefaultChannel(classId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const existing = await db.class_channels.findFirst({
    where: { classId, name: "umum" },
  });
  if (existing) return existing;

  // Create default "umum" channel
  return db.class_channels.create({
    data: {
      name: "umum",
      description: "Channel utama kelas",
      classId,
      createdBy: session.user.id,
    },
  });
}
