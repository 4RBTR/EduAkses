import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    // In a real scenario, cache this using Next.js unstable_cache or Prisma extensions
    // For this implementation, we aggregate efficiently.
    const userClasses = await prisma.classMember.findMany({
      where: { userId: session.user.id },
      select: { classId: true }
    });
    const classIds = userClasses.map(c => c.classId);

    // Fetch Assignments across multiple classes
    const assignments = await prisma.assignment.findMany({
      where: {
        classId: { in: classIds },
        title: { contains: query, mode: "insensitive" },
        fileUrl: { not: null }
      },
      include: {
        class: { select: { name: true } }
      },
      take: 20
    });

    // Fetch Contributions
    const contributions = await prisma.contribution.findMany({
      where: {
        classId: { in: classIds },
        status: "APPROVED",
        title: { contains: query, mode: "insensitive" }
      },
      include: {
        class: { select: { name: true } }
      },
      take: 20
    });

    // Map to normalized archive format
    const archiveItems = [
      ...assignments.map(a => ({
        id: `a-${a.id}`,
        title: a.title,
        description: `Tugas Kelas: ${a.class.name}`,
        fileUrl: a.fileUrl,
        type: "Tugas",
        date: a.createdAt,
      })),
      ...contributions.map(c => ({
        id: `c-${c.id}`,
        title: c.title,
        description: `Materi Kelas: ${c.class.name}`,
        fileUrl: c.fileUrl,
        type: "Materi",
        date: c.createdAt,
      }))
    ];

    // Sort by newest
    archiveItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(archiveItems);
  } catch (error) {
    console.error("[ARCHIVE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
