"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getPersonalEvents() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return await prisma.personalEvent.findMany({
    where: { userId: session.user.id }
  });
}

export async function createPersonalEvent(data: {
  title: string;
  description?: string;
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
  color: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.personalEvent.create({
    data: {
      ...data,
      userId: session.user.id
    }
  });
}
