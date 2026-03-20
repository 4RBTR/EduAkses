"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getPriorityMessages(partnerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const messages = await prisma.priorityMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: partnerId },
        { senderId: partnerId, receiverId: session.user.id }
      ]
    },
    orderBy: { createdAt: "asc" }
  });

  return messages;
}

export async function sendPriorityMessage(receiverId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const message = await prisma.priorityMessage.create({
    data: {
      content,
      senderId: session.user.id,
      receiverId
    }
  });

  await prisma.userNotification.create({
    data: {
      title: `Pesan Prioritas dari ${session.user.name}`,
      message: content ? content.substring(0, 60) : "Mengirim pesan prioritas",
      type: "MESSAGE",
      link: `/dashboard/messages`,
      userId: receiverId,
    },
  });

  revalidatePath("/dashboard/messages");
  return message;
}

export async function getPriorityContacts() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const myId = session.user.id;
  const myRole = session.user.role;

  // We find contacts based on classes. 
  // If TEACHER -> find CLASS_LEADERs in their classes.
  // If CLASS_LEADER -> find TEACHERs in their classes.

  const myClasses = await prisma.classMember.findMany({
    where: { userId: myId },
    select: { classId: true }
  });

  const classIds = myClasses.map(c => c.classId);

  let targetRole = "CLASS_LEADER";
  if (myRole === "CLASS_LEADER") targetRole = "TEACHER";

  if (myRole !== "TEACHER" && myRole !== "CLASS_LEADER") {
    // Only Teacher and Class Leader can use Priority Messages
    return [];
  }

  const contacts = await prisma.user.findMany({
    where: {
      role: targetRole as any,
      memberships: {
        some: { classId: { in: classIds } }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    }
  });

  // Filter distinct
  const uniqueContacts = Array.from(new Map(contacts.map(item => [item.id, item])).values());
  return uniqueContacts;
}
