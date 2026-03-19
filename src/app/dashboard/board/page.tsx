import { redirect } from "next/navigation";
import { auth as chatAuth } from "@/auth";

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Presentation } from "lucide-react";

export const metadata = {
  title: "Infinite Orbit | EduAkses",
};

export default async function BoardIndexPage() {
  const session = await chatAuth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch groups user is a member of
  const memberships = await prisma.groupMember.findMany({
    where: { userId: session.user.id },
    include: {
      group: {
        select: {
          id: true,
          name: true,
          _count: {
            select: { members: true }
          }
        }
      }
    }
  });

  const groups = memberships.map(m => m.group);

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start p-6 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
          The Infinite Orbit
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Papan tulis digital tanpa batas untuk koordinasi grup. Pilih grup untuk masuk ke orbit.
        </p>

        {groups.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <Presentation className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
            <p>Anda belum bergabung dalam grup diskusi manapun.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link key={group.id} href={`/dashboard/board/${group.id}`}>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-lg dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all group-hover cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>
                  <h3 className="text-xl font-bold text-zinc-800 dark:text-white mb-2">{group.name}</h3>
                  <div className="flex items-center text-sm text-zinc-500 dark:text-zinc-400 gap-2">
                    <Users className="w-4 h-4" />
                    {group._count.members} Anggota Orbit
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
