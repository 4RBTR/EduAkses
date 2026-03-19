import { redirect } from "next/navigation";
import { auth as chatAuth } from "@/auth";

import ArchiveClient from "./ArchiveClient";

export const metadata = {
  title: "Bento Archive | EduAkses",
};

export default async function ArchiveIndexPage() {
  const session = await chatAuth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Initial fetch will just be handled by the client to allow dynamic search caching
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start p-6 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
          The Bento Archive
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Library Digital lintas semester. Simpan dan cari materi atau tugas lama Anda dalam sekejap.
        </p>

        <ArchiveClient />
      </div>
    </div>
  );
}
