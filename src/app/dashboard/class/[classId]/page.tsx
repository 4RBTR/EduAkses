import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getClassDetail } from "@/app/actions/class";
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  Puzzle, 
  Clock, 
  Calendar,
  FileText,
  PlayCircle,
  CheckCircle2,
  ArrowLeft,
  Bell
} from "lucide-react";
import Link from "next/link";
import { SubmitAssignmentModal } from "./_components/SubmitAssignmentModal";
import { CopyInviteCode } from "./_components/CopyInviteCode";
import { LeaveClassButton } from "./_components/LeaveClassButton";
import { LeaderManagement } from "@/components/dashboard/LeaderManagement";
import { DeleteScheduleButton } from "@/components/dashboard/DeleteScheduleButton";
import { DeleteNotificationButton } from "@/components/dashboard/DeleteNotificationButton";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function ClassDetailPage(props: PageProps) {
  const params = await props.params;
  const { classId } = params;
  
  const session = await auth();
  if (!session?.user) redirect("/login");

  const cls = await getClassDetail(classId) as any;
  if (!cls) notFound();

  // Check if user is member
  const isMember = cls.members.some((m: any) => m.user.id === session.user.id);
  if (!isMember) {
    return (
      <div className="p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        <p>Anda bukan anggota kelas ini.</p>
        <Link href="/dashboard" className="text-primary hover:underline">Kembali ke Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Back Header */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-primary transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Dashboard
      </Link>

      {/* Class Hero */}
      <div className="relative p-8 md:p-12 bg-linear-to-br from-primary/10 via-indigo-500/5 to-transparent rounded-[2.5rem] border border-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <BookOpen className="w-48 h-48 text-primary" />
        </div>
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                {cls.members.find((m: any) => m.role === "TEACHER")?.user.name || "Guru Pengajar"}
              </div>
              {session.user.role === "TEACHER" && (
                <CopyInviteCode code={cls.inviteCode} />
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {cls.name}
            </h1>
            <p className="max-w-xl text-lg text-zinc-500 font-medium">
              {cls.description || "Selamat datang di ruang belajar kelas Anda. Akses semua materi dan tugas di sini."}
            </p>
          </div>
          
          <div>
            {session.user.role !== "TEACHER" && (
              <LeaveClassButton classId={cls.id} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Assignments & Quizzes */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Assignments Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <ClipboardList className="w-6 h-6 text-primary" />
              Tugas Mendatang
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {cls.assignments.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center text-zinc-400">
                  Belum ada tugas yang diberikan.
                </div>
              ) : (
                cls.assignments.map((assignment: any) => {
                  const mySubmission = assignment.submissions[0] as any;
                  const submissionCount = assignment.submissions.length;
                  
                  return (
                    <div id={`assignment-${assignment.id}`} key={assignment.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-primary/30 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                           <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{assignment.title}</h3>
                           {session.user.role === "TEACHER" && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                                {submissionCount} Dikumpulkan
                              </span>
                           )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-orange-500" />
                            Deadline: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString("id-ID") : "No limit"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {session.user.role === "TEACHER" ? (
                           <Link 
                              href={`/dashboard/teacher/class/${classId}/assignment/${assignment.id}`}
                              className="px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                           >
                              Lihat Pengumpulan
                           </Link>
                        ) : (
                           <Link 
                              href={`/dashboard/class/${classId}/assignment/${assignment.id}`}
                              className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all flex items-center gap-2"
                           >
                              <FileText className="w-4 h-4" />
                              Lihat Detail Tugas
                           </Link>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>


          {/* Announcements Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Bell className="w-6 h-6 text-yellow-500" />
              Pengumuman Kelas
            </h2>
            <div className="space-y-4">
              {cls.notifications.length === 0 ? (
                <div className="p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center text-zinc-400">
                  Belum ada pengumuman di kelas ini.
                </div>
              ) : (
                cls.notifications.map((n: any) => (
                  <div key={n.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex items-start justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{n.title}</h3>
                      <p className="text-sm text-zinc-500">{n.message}</p>
                      <p className="text-[10px] text-zinc-400">
                        Diposting pada: {new Date(n.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    { (session.user.role === "TEACHER" || session.user.role === "CLASS_LEADER") && (
                      <DeleteNotificationButton notificationId={n.id} />
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Quizzes Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Puzzle className="w-6 h-6 text-indigo-500" />
              Kuis & Latihan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cls.quizzes.length === 0 ? (
                <div className="md:col-span-2 p-10 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-center text-zinc-400">
                  Belum ada kuis tersedia.
                </div>
              ) : (
                cls.quizzes.map((quiz: any) => (
                  <div key={quiz.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{quiz.title}</h3>
                      <Puzzle className="w-5 h-5 text-indigo-500 opacity-20" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <FileText className="w-3 h-3" />
                      {quiz._count.questions} Soal
                    </div>
                    
                    {quiz.quizScores.length > 0 ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-400">Skor Tertinggi:</span>
                        <span className="text-lg font-black text-primary">{Math.max(...(quiz.quizScores as any[]).map(s => s.score))}</span>
                      </div>
                    ) : (
                      <Link 
                        href={`/dashboard/quizzes/${quiz.id}`}
                        className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                      >
                        <PlayCircle className="w-4 h-4" />
                        Mulai Kuis
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Class Schedule */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl p-6 space-y-6 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Jadwal Pelajaran
            </h3>
            <div className="space-y-4">
              {cls.lessonSchedules.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Belum ada jadwal yang diatur oleh Ketua Kelas.</p>
              ) : (
                cls.lessonSchedules.map((schedule: any) => (
                  <div key={schedule.id} className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 group/schedule">
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{schedule.subject}</p>
                      <p className="text-[10px] text-zinc-400 font-medium tracking-wide uppercase">
                        {["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][schedule.dayOfWeek]}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-black text-primary">
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      {session.user.role === "CLASS_LEADER" && (
                        <DeleteScheduleButton scheduleId={schedule.id} />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Leader Management Panel */}
          {session.user.role === "CLASS_LEADER" && (
            <LeaderManagement classId={classId} />
          )}

          {/* Members Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-4xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-zinc-400" />
                Anggota Kelas ({cls.members.length})
              </h3>
              <Link 
                href={`/dashboard/class/${classId}/members`}
                className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {cls.members.map((member: any) => (
                <div key={member.id} className="w-10 h-10 rounded-full bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-black group relative cursor-help">
                  {member.user.name.charAt(0)}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    {member.user.name} ({member.role})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
