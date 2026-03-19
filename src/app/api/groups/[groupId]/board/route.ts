import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const isMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId: session.user.id }
      }
    });

    if (!isMember && session.user.role !== "TEACHER") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    let board = await prisma.boardState.findUnique({
      where: { groupId }
    });

    if (!board) {
      board = await prisma.boardState.create({
        data: {
          groupId,
          state: { lines: [] } // Initial empty state with lines array
        }
      });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("[BOARD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const { groupId } = await params;
    const session = await auth();
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { state } = await req.json();

    const updatedBoard = await prisma.boardState.upsert({
      where: { groupId },
      update: { state },
      create: { groupId, state }
    });

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("[BOARD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
