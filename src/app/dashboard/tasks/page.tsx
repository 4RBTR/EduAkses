import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClipboardList, Calendar, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function StudentTasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch assignments from all classes the student has joined
  const assignments = await prisma.assignment.findMany({
    where: {
      class: {
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    },
    include: {
      class: true
    },
    orderBy: {
      dueDate: "asc"
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Tugas & Proyek
          </h1>
          <p className="text-zinc-500 mt-1">
            Pantau semua tugas dari kelas Anda dan jangan lewatkan tenggat waktu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assignments.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center shadow-sm">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-primary" />
             </div>
             <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Belum Ada Tugas</h3>
             <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
                Hebat! Sepertinya Anda sudah menyelesaikan semua kewajiban atau Guru belum memberikan tugas baru.
             </p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 gap-6 space-y-6">
            {assignments.map(assignment => {
              const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
              
              return (
                <div key={assignment.id} className="break-inside-avoid bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {assignment.class.name}
                     </span>
                     {isOverdue ? (
                       <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full animate-pulse">
                          <AlertCircle className="w-3 h-3" />
                          Terlewat
                       </span>
                     ) : (
                       <span className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Aktif
                       </span>
                     )}
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-primary transition-colors">
                    {assignment.title}
                  </h3>
                  
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                    {assignment.description || "Silakan cek detail tugas untuk instruksi lebih lanjut."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-zinc-50 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
                      <Clock className="w-4 h-4" />
                      {assignment.dueDate ? (
                        new Date(assignment.dueDate).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'long' 
                        })
                      ) : "No Deadline"}
                    </div>
                    
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                       Detail Tugas
                       <Calendar className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
