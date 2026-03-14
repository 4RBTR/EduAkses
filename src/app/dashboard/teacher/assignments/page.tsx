import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreateAssignmentForm } from "./_components/CreateAssignmentForm";
import { getTeacherAssignments } from "@/app/actions/assignment";
import { ClipboardList, Calendar, BookOpen, Clock, Users } from "lucide-react";
import { DeleteAssignmentButton } from "./_components/DeleteAssignmentButton";
import { EditAssignmentModal } from "./_components/EditAssignmentModal";
import { ExtensionRequestList } from "./_components/ExtensionRequestList";

export default async function TeacherAssignmentsPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  // Fetch classes taught by this teacher for the form
  const taughtClasses = await prisma.classMember.findMany({
    where: { userId: session.user.id, role: "TEACHER" },
    include: { class: true }
  });

  const classOptions = taughtClasses.map(m => ({ id: m.class.id, name: m.class.name }));

  // Fetch current assignments
  const [assignments, extensionRequests] = await Promise.all([
    getTeacherAssignments(),
    prisma.assignmentExtension.findMany({
      where: {
        status: "PENDING",
        assignment: {
          creatorId: session.user.id
        }
      },
      include: {
        student: { select: { name: true } },
        assignment: {
          include: {
            class: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }) as any
  ]);

  return (
    <div className="space-y-8 p-4 md:p-0">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Manajemen Tugas
        </h1>
        <p className="text-zinc-500 mt-1">
          Berikan instruksi, kumpulkan laporan, dan kelola tenggat waktu belajar siswa.
        </p>
      </div>

      <CreateAssignmentForm classes={classOptions} />

      {/* Extension Requests Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
           <Clock className="w-5 h-5 text-indigo-500" />
           Permintaan Dispensasi (Minto Waktu)
        </h2>
        <ExtensionRequestList requests={extensionRequests} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
           <ClipboardList className="w-5 h-5 text-primary" />
           Daftar Tugas Terbit
        </h2>
        
        {assignments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm">
             <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-zinc-400" />
             </div>
             <p className="text-zinc-500 font-medium">Belum ada tugas yang diterbitkan.</p>
             <p className="text-sm text-zinc-400 mt-1">Gunakan formulir di atas untuk memulai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                     <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">
                        {assignment.class.name}
                     </span>
                     <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                       {assignment.title}
                     </h3>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-1">
                     {assignment.description || "Tidak ada deskripsi."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                    <span className="flex items-center gap-1.5 line-clamp-1 max-w-[200px]">
                      <BookOpen className="w-3.5 h-3.5" />
                      ID: {assignment.id.substring(0, 8)}...
                    </span>
                    {assignment.dueDate && (
                      <span className="flex items-center gap-1.5 text-orange-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Deadline: {new Date(assignment.dueDate).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-100 dark:border-zinc-800">
                  <EditAssignmentModal assignment={assignment} />
                  <DeleteAssignmentButton assignmentId={assignment.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
