import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const contributionId = id;
    const userId = session.user.id;

    // Check if vote exists
    const existingVote = await prisma.contributionVote.findUnique({
      where: {
        userId_contributionId: {
          userId,
          contributionId,
        },
      },
    });

    if (existingVote) {
      // Remove vote (toggle)
      await prisma.$transaction([
        prisma.contributionVote.delete({
          where: { id: existingVote.id }
        }),
        prisma.contribution.update({
          where: { id: contributionId },
          data: { upvotes: { decrement: 1 } }
        })
      ]);
      return NextResponse.json({ voted: false });
    } else {
      // Add vote
      await prisma.$transaction([
        prisma.contributionVote.create({
          data: {
            userId,
            contributionId
          }
        }),
        prisma.contribution.update({
          where: { id: contributionId },
          data: { upvotes: { increment: 1 } }
        })
      ]);
      return NextResponse.json({ voted: true });
    }
  } catch (error) {
    console.error("[CONTRIBUTION_VOTE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
