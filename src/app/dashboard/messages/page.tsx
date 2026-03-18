import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PriorityChat } from "./_components/PriorityChat";

export const metadata = {
  title: "Priority Inbox | EduAkses",
};

export default async function PriorityMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role !== "TEACHER" && session.user.role !== "CLASS_LEADER") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-700">
      <div className="mb-6">
         <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Priority Inbox
         </h1>
         <p className="text-sm text-zinc-500 mt-1">
           {session.user.role === "TEACHER" ? "Kirim pesan khusus ke Ketua Kelas." : "Jalur komunikasi langsung dengan Guru."}
         </p>
      </div>

      <div className="flex-1 min-h-[500px] h-[calc(100vh-12rem)] max-h-[800px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
         <PriorityChat currentUserId={session.user.id} />
      </div>
    </div>
  );
}
