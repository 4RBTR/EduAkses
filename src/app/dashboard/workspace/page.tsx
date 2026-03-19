import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getNotes } from "./_actions/notes";
import { getAllUsers } from "@/app/actions/user";
import { WorkspaceTaskBoard } from "./_components/WorkspaceTaskBoard";

export const metadata = { title: "Workspace Task Board | EduAkses" };

export default async function WorkspacePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch data in parallel
  const [notes, allUsers] = await Promise.all([
    getNotes(),
    getAllUsers(),
  ]);

  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col animate-in fade-in duration-500">
      <WorkspaceTaskBoard 
        initialNotes={notes as any[]} 
        allUsers={allUsers} 
        currentUserId={session.user.id} 
      />
    </div>
  );
}
