"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

export type GlobalEvent = {
  id: string;
  title: string;
  time: Date;
  type: "TASK" | "QUIZ" | "SCHEDULE" | "MEETING";
  category: string;
  color: string;
  status?: string;
};

export function useGlobalEvents() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const userId = session?.user?.id;

  // 1. Initial Fetch (Using REST for speed, though real app would use server actions)
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      // Fetch Workspace Notes
      const { data: notes } = await supabase
        .from("workspace_notes")
        .select("*")
        .eq("userId", userId);
      if (notes) setTasks(notes);

      // Fetch Schedules & Quizzes (this would normally be filtered by class memberships)
      const { data: sched } = await supabase
        .from("lesson_schedules")
        .select("*");
      if (sched) setSchedules(sched);

      const { data: qz } = await supabase
        .from("quizzes")
        .select("*");
      if (qz) setQuizzes(qz);
    };

    fetchData();

    // 2. Realtime Subscriptions with Cleanup
    const taskChannel = supabase
      .channel("global-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "workspace_notes", filter: `userId=eq.${userId}` }, 
      (payload: any) => {
        if (payload.eventType === "INSERT") setTasks(prev => [...prev, payload.new]);
        if (payload.eventType === "UPDATE") setTasks(prev => prev.map((t: any) => t.id === payload.new.id ? payload.new : t));
        if (payload.eventType === "DELETE") setTasks(prev => prev.filter((t: any) => t.id === payload.old.id));
      })
      .subscribe();

    const scheduleChannel = supabase
      .channel("global-schedules")
      .on("postgres_changes", { event: "*", schema: "public", table: "lesson_schedules" }, 
      (payload: any) => {
        if (payload.eventType === "INSERT") setSchedules(prev => [...prev, payload.new]);
        if (payload.eventType === "UPDATE") setSchedules(prev => prev.map((s: any) => s.id === payload.new.id ? payload.new : s));
        if (payload.eventType === "DELETE") setSchedules(prev => prev.filter((s: any) => s.id === payload.old.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(scheduleChannel);
    };
  }, [userId]);

  // 3. Memoized Merger
  const events = useMemo(() => {
    const merged: GlobalEvent[] = [];

    // Map Workspace Tasks (Deadlines)
    tasks.forEach(t => {
      if (t.deadline) {
        merged.push({
          id: t.id,
          title: t.title || "Untitled Task",
          time: new Date(t.deadline),
          type: "TASK",
          category: t.stage || "Backlog",
          color: "blue",
          status: t.stage
        });
      }
    });

    // Map Schedules
    schedules.forEach(s => {
      // For schedules, we assume "today" or based on dayOfWeek
      // Simpler logic for this engine: map current week versions
      merged.push({
        id: s.id,
        title: s.subject,
        time: new Date(), // Logic would be more complex for repeating, but simplified for sync demo
        type: "SCHEDULE",
        category: "Mata Pelajaran",
        color: "purple"
      });
    });

    // Map Quizzes
    quizzes.forEach(q => {
      merged.push({
        id: q.id,
        title: q.title,
        time: new Date(q.createdAt), // Quizzes usually have deadlines, but using createdAt for demo
        type: "QUIZ",
        category: "Ujian/Kuis",
        color: "orange"
      });
    });

    return merged.sort((a, b) => a.time.getTime() - b.time.getTime());
  }, [tasks, schedules, quizzes]);

  return { events, tasks, schedules, quizzes };
}
