"use client";

import { useState } from "react";
import { AssignmentReport } from "../../assignments/_components/AssignmentReport";
import { QuizAnalytics } from "../../quizzes/_components/QuizAnalytics";
import { ClipboardList, Puzzle } from "lucide-react";

interface ItemDef {
  id: string;
  title: string;
  className: string;
}

export default function ReportsDashboard({ assignments, quizzes }: { assignments: ItemDef[], quizzes: ItemDef[] }) {
  const [activeTab, setActiveTab] = useState<"ASSIGNMENTS" | "QUIZZES">("ASSIGNMENTS");
  const [selectedId, setSelectedId] = useState<string>("");

  return (
    <div className="space-y-6">
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        <button 
          onClick={() => { setActiveTab("ASSIGNMENTS"); setSelectedId(""); }}
          className={`flex-1 sm:flex-none py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "ASSIGNMENTS" ? "border-primary text-primary" : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
        >
          <ClipboardList className="w-4 h-4" /> Laporan Tugas
        </button>
        <button 
          onClick={() => { setActiveTab("QUIZZES"); setSelectedId(""); }}
          className={`flex-1 sm:flex-none py-3 px-6 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "QUIZZES" ? "border-primary text-primary" : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
        >
          <Puzzle className="w-4 h-4" /> Analitik Kuis
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            Pilih {activeTab === "ASSIGNMENTS" ? "Tugas" : "Kuis"} untuk dianalisis
          </label>
          <select 
            className="w-full sm:max-w-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm appearance-none"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Pilih {activeTab === "ASSIGNMENTS" ? "Tugas" : "Kuis"} --</option>
            {(activeTab === "ASSIGNMENTS" ? assignments : quizzes).map(item => (
              <option key={item.id} value={item.id}>
                [{item.className}] {item.title}
              </option>
            ))}
          </select>
        </div>

        {selectedId ? (
          <div className="mt-4 animate-in fade-in duration-500">
             {activeTab === "ASSIGNMENTS" ? (
               <AssignmentReport assignmentId={selectedId} />
             ) : (
               <QuizAnalytics quizId={selectedId} />
             )}
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center text-zinc-500 dark:text-zinc-400 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50">
            {activeTab === "ASSIGNMENTS" ? <ClipboardList className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700" /> : <Puzzle className="w-12 h-12 mb-4 text-zinc-300 dark:text-zinc-700" />}
            <p className="font-medium text-lg text-zinc-700 dark:text-zinc-300">Belum Ada Pilihan</p>
            <p className="text-sm mt-1 max-w-sm">Silakan pilih {activeTab === "ASSIGNMENTS" ? "tugas" : "kuis"} dari menu dropdown di atas untuk memulai analisis dan mengunduh laporan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
