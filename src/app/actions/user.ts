"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getAllUsers() {
  const session = await auth();
  if (!session) return [];

  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      avatar: true,
    },
    orderBy: { name: "asc" },
  });
}
