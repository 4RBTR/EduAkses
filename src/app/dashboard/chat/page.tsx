import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDMContacts } from "./_actions/dm";
import { getMyGroups } from "./_actions/groups";
import { ChatLayout } from "./_components/ChatLayout";
import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Chat | EduAkses",
};

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [contacts, groups] = await Promise.all([
    getDMContacts(),
    getMyGroups(),
  ]);

  return (
    <div className="flex flex-col h-full p-4 lg:p-6 pb-0 lg:pb-0 animate-in fade-in duration-500">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-primary" />
          Chat Terpadu
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Direct message atau grup chat dengan semua anggota kelas.
        </p>
      </div>

      <div className="flex-1 min-h-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm mb-4 lg:mb-6">
        <ChatLayout
          currentUserId={session.user.id}
          currentUserName={session.user.name || "You"}
          contacts={contacts}
          groups={groups}
        />
      </div>
    </div>
  );
}
