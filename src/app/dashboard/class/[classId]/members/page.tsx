import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Users, GraduationCap, ShieldCheck, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ClassMembersPage(props: PageProps) {
  const params = await props.params;
  const { classId } = params;

  const session = await auth();
  if (!session?.user) redirect("/login");

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true,
              points: true,
            }
          }
        },
        orderBy: { role: "asc" }
      }
    }
  });

  if (!cls) notFound();

  const isTeacher = session.user.role === "TEACHER";
  const isLeader = session.user.role === "CLASS_LEADER";

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="space-y-4">
        <Link 
          href={`/dashboard/class/${classId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Kelas
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tight uppercase">
              Anggota Kelas
            </h1>
            <p className="text-zinc-500 font-bold mt-1">
              Kelas: <span className="text-primary">{cls.name}</span>
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-black">{cls.members.length} Orang</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Group by Role */}
        {["TEACHER", "CLASS_LEADER", "STUDENT"].map((role) => {
          const roleMembers = cls.members.filter(m => m.user.role === role);
          if (roleMembers.length === 0) return null;

          return (
            <section key={role} className="space-y-4">
              <h2 className="text-xs font-black uppercase text-zinc-400 tracking-[0.3em] flex items-center gap-2">
                {role === "TEACHER" && <ShieldCheck className="w-4 h-4 text-primary" />}
                {role === "CLASS_LEADER" && <Star className="w-4 h-4 text-emerald-500" />}
                {role === "STUDENT" && <GraduationCap className="w-4 h-4 text-blue-500" />}
                {role === "TEACHER" ? "Tenaga Pengajar" : role === "CLASS_LEADER" ? "Ketua Kelas" : "Siswa"}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {roleMembers.map((member) => (
                  <div 
                    key={member.id} 
                    className={cn(
                      "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl flex items-center justify-between shadow-xs transition-all",
                      member.user.id === session.user.id && "ring-2 ring-primary/20 bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black text-zinc-400">
                        {member.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          {member.user.name}
                          {member.user.id === session.user.id && (
                             <span className="text-[8px] bg-primary text-white px-1.5 py-0.5 rounded font-black uppercase">Anda</span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-500 font-medium">{member.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {role !== "TEACHER" && (
                        <div className="text-right hidden sm:block">
                           <p className="text-[10px] font-black uppercase text-zinc-400">Poin XP</p>
                           <p className="font-black text-primary">{member.user.points.toLocaleString()}</p>
                        </div>
                      )}
                      
                      {isTeacher && member.user.role !== "TEACHER" && (
                        <Link 
                          href={`/dashboard/teacher/class/${classId}/members/${member.user.id}`}
                          className="h-10 w-10 bg-zinc-100 dark:bg-zinc-900 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all group"
                        >
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  );
}
