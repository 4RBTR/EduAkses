"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  points: number;
  isCurrentUser: boolean;
};

export async function getClassLeaderboard(classId: string): Promise<LeaderboardEntry[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const members = await prisma.classMember.findMany({
    where: { classId },
    select: {
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          points: true,
        },
      },
    },
    orderBy: {
      user: { points: "desc" },
    },
    take: 10,
  });

  return members.map((m, idx) => ({
    rank: idx + 1,
    userId: m.user.id,
    name: m.user.name,
    avatar: m.user.avatar,
    points: m.user.points,
    isCurrentUser: m.user.id === session!.user!.id,
  }));
}
