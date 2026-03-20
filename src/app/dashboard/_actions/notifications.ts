"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

// ── Get all notifications for current user ──
export async function getUserNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.userNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

// ── Get unread count ──
export async function getUnreadNotificationCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  return db.userNotification.count({
    where: { userId: session.user.id, isRead: false },
  });
}

// ── Mark a notification as read ──
export async function markNotificationRead(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.userNotification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

// ── Mark all as read ──
export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.userNotification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
}

// ── Create a notification for a user (internal utility) ──
export async function createUserNotification(
  userId: string,
  title: string,
  message: string,
  type: string,
  link?: string
) {
  return db.userNotification.create({
    data: { userId, title, message, type, link },
  });
}

// ── Delete a specific user notification ──
export async function deleteUserNotification(notificationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership before deleting
  const notif = await db.userNotification.findUnique({
    where: { id: notificationId },
  });
  
  if (!notif || notif.userId !== session.user.id) {
    throw new Error("Not found or unauthorized");
  }

  return db.userNotification.delete({
    where: { id: notificationId },
  });
}

// ── Delete all user notifications ──
export async function deleteAllUserNotifications() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.userNotification.deleteMany({
    where: { userId: session.user.id },
  });
}

// ── Get class-level notifications for current user ──
export async function getClassNotifications() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const memberships = await prisma.classMember.findMany({
    where: { userId: session.user.id },
    select: { classId: true },
  });
  const classIds = memberships.map((m) => m.classId);

  return prisma.notification.findMany({
    where: { classId: { in: classIds } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}
