import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle2, Clock } from "lucide-react";
import { GradeForm } from "./_components/GradeForm";

interface PageProps {
  params: Promise<{
    classId: string;
    assignmentId: string;
  }>;
}

export default async function TeacherAssignmentSubmissionsPage(props: PageProps) {
  const params = await props.params;
  const { classId, assignmentId } = params;
  
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // Verify ownership
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      members: {
        where: { userId: session.user.id, role: "TEACHER" }
      }
    }
  });

  if (!cls || cls.members.length === 0) {
    notFound();
  }

  // Get assignment and all submissions + all students in the class
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      submissions: {
        include: {
          student: true
        }
      },
      class: {
        include: {
          members: {
            where: { role: { in: ["STUDENT", "CLASS_LEADER"] } },
            include: { user: true }
          }
        }
      }
    }
  });

  if (!assignment) notFound();

  const allStudents = assignment.class.members.map(m => m.user);
  const submissionsByStudentId = new Map(
    assignment.submissions.map(s => [s.studentId, s])
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <Link href={`/dashboard/class/${classId}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-primary transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail Kelas
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-black">{assignment.title}</h1>
        <p className="text-zinc-500">Daftar Pengumpulan Tugas</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allStudents.map(student => {
          const submission = submissionsByStudentId.get(student.id);
          const hasSubmitted = !!submission;

          return (
            <div key={student.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-6 shadow-sm">
              <div className="space-y-2 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold uppercase shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-xs text-zinc-500">{student.email}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-auto">
                    {hasSubmitted ? (
                      <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 border border-green-200 text-xs font-bold rounded-full items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> Dikumpulkan
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-full items-center gap-1 w-max">
                        <Clock className="w-3 h-3" /> Belum Mengumpulkan
                      </span>
                    )}
                  </div>
                </div>

                {hasSubmitted && (
                  <div className="mt-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-3 border border-zinc-100 dark:border-zinc-800">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Catatan Siswa</span>
                      <p className="text-sm mt-1">{submission.content || "-"}</p>
                    </div>
                    {submission.fileUrl && (
                      <div>
                        <a 
                          href={submission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          Lihat File Jawaban
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="md:w-72 mt-4 md:mt-0 shrink-0">
                {hasSubmitted ? (
                  <GradeForm 
                    submissionId={submission.id}
                    initialGrade={submission.grade}
                    initialComment={submission.teacherComment}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-400 text-sm text-center">
                    Menunggu siswa <br/>mengumpulkan tugas
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {allStudents.length === 0 && (
          <div className="p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center text-zinc-400">
            Belum ada siswa di kelas ini.
          </div>
        )}
      </div>
    </div>
  );
}
