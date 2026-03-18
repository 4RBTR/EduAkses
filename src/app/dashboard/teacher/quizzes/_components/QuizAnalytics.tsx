"use client";

import { useEffect, useState } from "react";
import { getQuizAnalytics } from "../_actions/analytics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { Download, FileText, BarChart3 } from "lucide-react";

interface AnalyticsItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  hasAttempted: boolean;
  score: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completionPercentage: number;
  attemptedAt: Date | null;
}

export function QuizAnalytics({ quizId }: { quizId: string }) {
  const [data, setData] = useState<AnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizAnalytics(quizId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Quiz Analytics Report", 14, 15);
    
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Attempted", "Score", "Correct", "Incorrect", "Completion %"]],
      body: data.map(item => [
        item.studentName,
        item.hasAttempted ? "Yes" : "No",
        item.score.toString(),
        item.correctAnswers.toString(),
        item.incorrectAnswers.toString(),
        `${item.completionPercentage}%`
      ])
    });

    doc.save(`Quiz_Analytics_${quizId}.pdf`);
  };

  const handleExportCSV = () => {
    const csvData = data.map(item => ({
      "Name": item.studentName,
      "Email": item.studentEmail,
      "Attempted": item.hasAttempted ? "Yes" : "No",
      "Score": item.score,
      "Correct": item.correctAnswers,
      "Incorrect": item.incorrectAnswers,
      "Completion %": item.completionPercentage,
      "Attempted At": item.attemptedAt ? new Date(item.attemptedAt).toLocaleString("id-ID") : "-"
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Quiz_Analytics_${quizId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-4 text-center">Loading Analytics...</div>;

  return (
    <div className="mt-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Quiz Analytics
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-sm">
              <th className="pb-3 px-4 font-medium">Student Name</th>
              <th className="pb-3 px-4 font-medium">Attempted</th>
              <th className="pb-3 px-4 font-medium">Score</th>
              <th className="pb-3 px-4 font-medium">Correct/Incorrect</th>
              <th className="pb-3 px-4 font-medium">Completion %</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((row) => (
              <tr key={row.studentId} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.studentName}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.hasAttempted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                    {row.hasAttempted ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                  {row.hasAttempted ? row.score : '-'}
                </td>
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                  {row.hasAttempted ? (
                    <div className="flex gap-2">
                       <span className="text-emerald-600">{row.correctAnswers}</span> / <span className="text-rose-600">{row.incorrectAnswers}</span>
                    </div>
                  ) : '-'}
                </td>
                <td className="py-3 px-4">
                  {row.hasAttempted ? (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-500" 
                          style={{ width: `${row.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{row.completionPercentage}%</span>
                    </div>
                  ) : '-'}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
