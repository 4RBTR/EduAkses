import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getNote } from "../_actions/notes";
import { NoteEditor } from "./_components/NoteEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const note = await getNote(id);
  if (!note) notFound();

  return (
    <div className="-m-4 md:-m-6 min-h-screen">
      <NoteEditor
        note={{
          id: note.id,
          title: note.title,
          content: note.content,
          coverUrl: note.coverUrl,
          icon: note.icon,
          isPinned: note.isPinned,
          stage: note.stage,
          role: note.role,
          activityType: note.activityType,
          startDate: note.startDate,
          deadline: note.deadline,
          picId: note.picId,
        }}
      />
    </div>
  );
}
