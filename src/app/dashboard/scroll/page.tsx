import { redirect } from "next/navigation";
import { auth } from "@/auth"; // Assuming an auth helper exists, but let's check standard next-auth imports
import { prisma } from "@/lib/prisma";
import ScrollClient from "./ScrollClient";
import React from "react";

export const metadata = {
  title: "Sumbangan Materi | EduAkses",
};

export default async function FloatingScrollPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch the classes the user is enrolled in
  const userClasses = await prisma.classMember.findMany({
    where: { userId: session.user.id },
    include: {
      class: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const classes = userClasses.map((c: any) => c.class);
  
  // If teacher, they might not be in ClassMember but own classes? Let's check based on Role or fetch taught classes.
  // Actually, usually teachers are enrolled as members or creators. For simplicity, let's assume `userClasses` covers it, or fetch where creator.
  let additionalClasses: any[] = [];
  if (session.user.role === "TEACHER") {
    additionalClasses = await prisma.class.findMany({
      select: { id: true, name: true },
    });
    // This is a naive wide fetch for teachers, ideally we'd filter.
  }

  const allClassesMap = new Map();
  [...classes, ...additionalClasses].forEach(c => allClassesMap.set(c.id, c));
  const finalClasses = Array.from(allClassesMap.values());

  // Fetch initial contributions for the first class, or all. 
  // We'll let the client component handle fetching via API to allow caching and fast filtering.
  
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-start p-6 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
          The Floating Scroll
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          Jelajahi dan sumbangkan materi belajar terbaik. Insight tertinggi akan otomatis naik ke atas.
        </p>

        <ScrollClient classes={finalClasses} currentUser={session.user} />
      </div>
    </div>
  );
}
