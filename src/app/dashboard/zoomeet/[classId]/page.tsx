import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { JitsiWrapper } from "./_components/JitsiWrapper";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ZoomeetRoom(props: PageProps) {
  const params = await props.params;
  const { classId } = params;

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Verify membership in the class
  const member = await prisma.classMember.findUnique({
    where: {
      userId_classId: {
        userId: session.user.id,
        classId: classId
      }
    },
    include: {
      class: true
    }
  });

  if (!member || !member.class) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6 mx-auto" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Akses Ditolak
        </h1>
        <p className="text-zinc-500 mt-2 max-w-md mx-auto mb-8">
          Anda tidak tergabung dalam kelas ini atau Anda mencoba mengakses ruang video yang salah.
        </p>
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const roomName = `EduAkses_Class_${classId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const userName = session.user.name || "Peserta Anonim";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Meeting Room: {member.class.name}
        </h1>
        <p className="text-zinc-500">
          Bergabung sebagai: <strong className="text-zinc-700 dark:text-zinc-300">{userName}</strong> ({member.role.replace("_", " ")})
        </p>
      </div>

      {/* Render Jitsi Client with full Focus Mode support */}
      <JitsiWrapper roomName={roomName} userName={userName} />
    </div>
  );
}
