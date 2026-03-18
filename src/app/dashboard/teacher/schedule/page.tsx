import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LeaderManagement } from "@/components/dashboard/LeaderManagement";
import { DeleteScheduleButton } from "@/components/dashboard/DeleteScheduleButton";
import { DeleteNotificationButton } from "@/components/dashboard/DeleteNotificationButton";
import { Calendar, Clock, BookOpen, AlertCircle, Bell } from "lucide-react";

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default async function TeacherSchedulePage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // Find first class this teacher manages
  const membership = await prisma.classMember.findFirst({
    where: { userId: session.user.id, role: "TEACHER" },
    include: { class: true }
  });

  if (!membership?.classId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-zinc-400 mb-4" />
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Belum Terdaftar di Kelas</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Anda belum terdaftar sebagai guru di kelas manapun.</p>
      </div>
    );
  }

  const { classId, class: classData } = membership;

  const schedules = await prisma.lessonSchedule.findMany({
    where: { classId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
  });

  const [assignments, notifications] = await Promise.all([
    prisma.assignment.findMany({
      where: { classId, dueDate: { gte: new Date() } },
      orderBy: { dueDate: "asc" },
      take: 5
    }),
    prisma.notification.findMany({
      where: { classId },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return (
    <div className="space-y-8 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Jadwal & Reminder Kelas
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Kelas: <strong className="text-zinc-700 dark:text-zinc-300">{classData.name}</strong>
        </p>
      </div>

      {/* Reuse the LeaderManagement form which works for both class leader and teacher */}
      <LeaderManagement classId={classId} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Jadwal Pelajaran</h2>
          </div>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Hari</th>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Mata Pelajaran</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                        Belum ada jadwal yang ditambahkan.
                      </td>
                    </tr>
                  ) : (
                    schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{DAYS[s.dayOfWeek]}</td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {s.startTime} - {s.endTime}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100 font-medium">
                            <BookOpen className="w-4 h-4 text-primary" /> {s.subject}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <DeleteScheduleButton scheduleId={s.id} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Tugas Deadline Dekat</h2>
            </div>
            <div className="flex flex-col gap-3">
              {assignments.length === 0 ? (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Tidak ada tugas mendekati deadline.</p>
                </div>
              ) : assignments.map((a) => (
                <div key={a.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{a.title}</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {a.dueDate ? new Date(a.dueDate).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) : "Tanpa deadline"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Pengumuman Kelas</h2>
            </div>
            <div className="flex flex-col gap-3">
              {notifications.length === 0 ? (
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center shadow-sm">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Belum ada pengumuman.</p>
                </div>
              ) : notifications.map((n) => (
                <div key={n.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-start justify-between gap-4 shadow-sm">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">{n.title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">{n.message}</p>
                  </div>
                  <DeleteNotificationButton notificationId={n.id} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
