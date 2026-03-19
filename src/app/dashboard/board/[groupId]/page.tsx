import { redirect } from "next/navigation";
import { auth as chatAuth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CanvasProvider } from "@/components/board/CanvasContext";
import InfiniteCanvas from "@/components/board/InfiniteCanvas";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Orbit Board | EduAkses",
};

export default async function BoardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  
  const session = await chatAuth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Verify membership
  const isMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: { groupId, userId: session.user.id }
    },
    include: {
      group: true
    }
  });

  if (!isMember && session.user.role !== "TEACHER") {
    redirect("/dashboard/board");
  }

  // Fetch initial board state
  let board = await prisma.boardState.findUnique({
    where: { groupId }
  });

  let initialLines = [];
  if (board && board.state && (board.state as any).lines) {
    initialLines = (board.state as any).lines;
  }

  return (
    <div className="w-full h-screen relative bg-zinc-950 flex flex-col overflow-hidden">
      {/* Top Navbar overlay */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between pointer-events-none">
        <Link href="/dashboard/board" className="pointer-events-auto flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white transition-colors border border-white/10">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Orbit</span>
        </Link>
        
        <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-xl border border-white/10 pointer-events-auto">
          <h1 className="text-white font-bold">{isMember?.group.name || "Group Board"}</h1>
        </div>
        
        <div className="w-32"></div> {/* Spacer for symmetry */}
      </div>

      <CanvasProvider groupId={groupId} initialLines={initialLines}>
        <InfiniteCanvas />
      </CanvasProvider>
    </div>
  );
}
