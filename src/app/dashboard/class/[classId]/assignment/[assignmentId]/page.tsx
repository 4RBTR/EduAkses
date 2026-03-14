import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  Clock3
} from "lucide-react";
import { SubmitAssignmentModal } from "../../_components/SubmitAssignmentModal";
import { RequestExtensionForm } from "./_components/RequestExtensionForm";

interface PageProps {
  params: Promise<{
    classId: string;
    assignmentId: string;
  }>;
}

export default async function StudentAssignmentDetailPage(props: PageProps) {
  const params = await props.params;
  const { classId, assignmentId } = params;
  
  const session = await auth();
  if (!session?.user || session.user.role === "TEACHER") {
    redirect("/dashboard");
  }

  // Verify membership
  const membership = await prisma.classMember.findUnique({
    where: {
      userId_classId: {
        userId: session.user.id,
        classId: classId
      }
    }
  });

  if (!membership) {
    notFound();
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId, classId },
    include: {
      class: true,
      submissions: {
        where: { studentId: session.user.id }
      },
      extensions: {
        where: { studentId: session.user.id }
      }
    }
  });

  if (!assignment) notFound();

  const assignmentAny = assignment as any;
  const submission = assignment.submissions[0] as any;
  const extension = assignmentAny.extensions?.[0]; // Use any since types might be stale
  const hasSubmitted = !!submission;
  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !hasSubmitted;
  const isBlocked = isOverdue && (!extension || extension.status !== "APPROVED");

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <Link href={`/dashboard/class/${classId}`} className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-primary transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail Kelas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-4xl shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {assignment.class.name}
                </span>
                
                <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
                  <Calendar className="w-3 h-3" />
                  Dibuat: {new Date(assignment.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-zinc-100">
                {assignment.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                  hasSubmitted ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/50" : 
                  isOverdue ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/50 animate-pulse" : 
                  "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-800/50"
                 }`}>
                   {hasSubmitted ? (
                     <><CheckCircle2 className="w-5 h-5" /> Status: Dikumpulkan</>
                   ) : isOverdue ? (
                     <><AlertCircle className="w-5 h-5" /> Status: Terlewat (Overdue)</>
                   ) : (
                     <><Clock className="w-5 h-5" /> Status: Belum Dikumpulkan</>
                   )}
                </div>

                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <Clock className="w-5 h-5" />
                  Tenggat Waktu: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString('id-ID', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : "Tidak Ada"}
                </div>
              </div>
            </div>

            <hr className="border-zinc-100 dark:border-zinc-800" />

            <div className="space-y-4">
              <h3 className="text-lg font-bold">Instruksi Tugas</h3>
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300">
                {assignment.description ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
                ) : (
                  <p className="italic text-zinc-400">Tidak ada instruksi tertulis yang diberikan guru.</p>
                )}
              </div>
            </div>

            {assignmentAny.fileUrl && (
              <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                 <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Lampiran Materi Utama</h3>
                 <a 
                    href={assignmentAny.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 p-4 w-full sm:w-auto bg-primary/5 border border-primary/20 rounded-2xl text-primary font-bold hover:bg-primary/10 transition-colors"
                  >
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    Lihat Lampiran Guru
                 </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submission Status & Action */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-4xl shadow-sm space-y-6 sticky top-8">
            <h2 className="text-xl font-bold border-b border-zinc-100 dark:border-zinc-800 pb-4">Tugas Anda</h2>
            
            {!hasSubmitted ? (
               <div className="space-y-4">
                  {!isBlocked ? (
                    <>
                      <p className="text-sm text-zinc-500">Anda belum mengumpulkan tugas ini. Silakan kumpulkan file atau catatan Anda menggunakan tombol di bawah.</p>
                      {extension?.status === "APPROVED" && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-xl text-[10px] font-bold text-emerald-600 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Dispensasi Disetujui: Anda dapat mengumpulkan sekarang.
                        </div>
                      )}
                      <SubmitAssignmentModal 
                        assignmentId={assignment.id} 
                        assignmentTitle={assignment.title} 
                      />
                    </>
                  ) : (
                    <RequestExtensionForm 
                      assignmentId={assignment.id} 
                      currentRequest={extension} 
                    />
                  )}
               </div>
            ) : (
               <div className="space-y-6">
                 {/* Student's Work */}
                 <div className="space-y-3">
                   <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pekerjaan Anda</h3>
                   {submission.content && (
                     <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm italic text-zinc-600 dark:text-zinc-400">
                       "{submission.content}"
                     </div>
                   )}
                   {submission.fileUrl && (
                     <a 
                       href={submission.fileUrl} 
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                     >
                       <div className="flex items-center gap-2 text-sm font-semibold truncate">
                         <FileText className="w-4 h-4 shrink-0 text-primary" />
                         <span className="truncate">Tautan Jawaban</span>
                       </div>
                       <ArrowLeft className="w-4 h-4 shrink-0 rotate-135 opacity-50" />
                     </a>
                   )}
                   <p className="text-xs text-zinc-500 mt-2">
                     Dikumpulkan pada: {new Date(submission.createdAt).toLocaleString('id-ID')}
                   </p>
                 </div>

                 {/* Grading Section */}
                 <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Hasil Penilaian</h3>
                    {submission.grade !== null && submission.grade !== undefined ? (
                       <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl relative overflow-hidden">
                          <div className="absolute -right-4 -bottom-4 opacity-5">
                            <CheckCircle2 className="w-32 h-32 text-emerald-500" />
                          </div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 relative z-10">Nilai Akhir</p>
                          <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-1 relative z-10">{submission.grade} <span className="text-xl opacity-50">/ 100</span></p>
                          
                          {submission.teacherComment && (
                             <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50 relative z-10">
                               <p className="text-[10px] font-bold text-emerald-700/70 dark:text-emerald-400/70 uppercase tracking-widest mb-1">Komentar Guru</p>
                               <p className="text-sm text-emerald-900 dark:text-emerald-200 italic">"{submission.teacherComment}"</p>
                             </div>
                          )}
                       </div>
                    ) : (
                       <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-center">
                         <p className="text-sm font-medium text-zinc-500">Guru belum memberikan nilai.</p>
                       </div>
                    )}
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
