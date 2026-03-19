import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    // Get all classes the user is in
    const memberships = await prisma.classMember.findMany({
      where: { userId: session.user.id },
      select: { classId: true },
    });
    const classIds = memberships.map((m) => m.classId);

    if (classIds.length === 0) {
      return NextResponse.json([]);
    }

    // First ensure default channels exist for these classes
    if (session.user.role === "TEACHER" || session.user.role === "CLASS_LEADER") {
       for (const cid of classIds) {
         const existing = await db.class_channels.findFirst({
           where: { classId: cid, name: "umum" }
         });
         if (!existing) {
           await db.class_channels.create({
             data: { name: "umum", description: "Channel utama kelas", classId: cid, createdBy: session.user.id }
           });
         }
       }
    }

    // Return all channels for the user's classes
    const channels = await db.class_channels.findMany({
      where: { classId: { in: classIds } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(channels);
  } catch (error) {
    console.error("[CHANNELS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
