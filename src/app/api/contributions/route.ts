import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const whereClause: any = {
      status: "APPROVED" // by default show approved ones
    };

    if (classId && classId !== "all") {
      whereClause.classId = classId;
    } else {
      // If "all", ideally filter by classes the user is enrolled in
      const userClasses = await prisma.classMember.findMany({
        where: { userId: session.user.id },
        select: { classId: true }
      });
      const classIds = userClasses.map(m => m.classId);
      // Teachers might need a broader fetch, but this works for simple cases
      if (session.user.role === "TEACHER") {
         // Teachers see all in their classes, maybe more, let's keep it simple
      } else {
         whereClause.classId = { in: classIds };
      }
    }

    const contributions = await prisma.contribution.findMany({
      where: whereClause,
      include: {
        uploader: {
          select: { name: true, avatar: true }
        },
        votes: {
          where: { userId: session.user.id } // check if current user voted
        }
      },
      orderBy: { upvotes: "desc" },
      take: 50 // cache / limit
    });

    return NextResponse.json(contributions);
  } catch (error) {
    console.error("[CONTRIBUTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, fileUrl, fileType, classId } = body;

    if (!title || !fileUrl || !classId) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // Determine status based on role. Teachers/Leaders auto-approve. Students pending.
    const status = (session.user.role === "TEACHER" || session.user.role === "CLASS_LEADER") 
      ? "APPROVED" 
      : "PENDING";

    const contribution = await prisma.contribution.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        classId,
        uploaderId: session.user.id,
        status
      }
    });

    return NextResponse.json(contribution);
  } catch (error) {
    console.error("[CONTRIBUTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
