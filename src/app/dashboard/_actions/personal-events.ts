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

  try {
    const newEvent = await prisma.personalEvent.create({
      data: {
        ...data,
        userId: session.user.id
      }
    });
    
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/calendar");
    
    return newEvent;
  } catch (error) {
    console.error("Failed to create personal event:", error);
    throw new Error("Failed to create personal event");
  }
}

export async function updatePersonalEvent(id: string, data: {
  title: string;
  description?: string;
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const updated = await prisma.personalEvent.updateMany({
      where: { id, userId: session.user.id },
      data
    });
    
    if (updated.count === 0) throw new Error("Event not found or unauthorized");

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/calendar");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update personal event:", error);
    throw new Error("Failed to update personal event");
  }
}

export async function deletePersonalEvent(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const deleted = await prisma.personalEvent.deleteMany({
      where: { id, userId: session.user.id }
    });

    if (deleted.count === 0) throw new Error("Event not found or unauthorized");

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/dashboard/calendar");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete personal event:", error);
    throw new Error("Failed to delete personal event");
  }
}
