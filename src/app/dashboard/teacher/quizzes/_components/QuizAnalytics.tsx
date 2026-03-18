"use client";

import { useEffect, useState } from "react";
import { getQuizAnalytics } from "../_actions/analytics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { Download, FileText, BarChart3, CheckCircle2, XCircle } from "lucide-react";

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
      .then((res) => setData(res as AnalyticsItem[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Laporan Analitik Kuis - EduAkses", 14, 15);
    doc.setFontSize(11);
    doc.text(`ID Kuis: ${quizId}`, 14, 22);
    
    autoTable(doc, {
      startY: 30,
      head: [["Nama Siswa", "Status", "Skor", "Benar", "Salah", "Penyelesaian"]],
      body: data.map(item => [
        item.studentName,
        item.hasAttempted ? "Sudah" : "Belum",
        item.hasAttempted ? Math.round(item.score).toString() : "-",
        item.correctAnswers.toString(),
        item.incorrectAnswers.toString(),
        `${item.completionPercentage}%`
      ]),
      headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
    });

    doc.save(`Laporan_Kuis_${quizId}.pdf`);
  };

  const handleExportCSV = () => {
    const csvData = data.map(item => ({
      "Nama Siswa": item.studentName,
      "Email": item.studentEmail,
      "Status": item.hasAttempted ? "Sudah Mengerjakan" : "Belum Mengerjakan",
      "Skor": item.hasAttempted ? Math.round(item.score) : "-",
      "Jawaban Benar": item.correctAnswers,
      "Jawaban Salah": item.incorrectAnswers,
      "Persentase": `${item.completionPercentage}%`,
      "Waktu Pengerjaan": item.attemptedAt ? new Date(item.attemptedAt).toLocaleString("id-ID") : "-"
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Analitik_Kuis_${quizId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-500 animate-pulse">Memuat Analitik...</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Statistik Hasil Kuis
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Pantau performa dan tingkat kelulusan siswa secara real-time.</p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
              <th className="pb-4 px-4 font-bold">Nama Siswa</th>
              <th className="pb-4 px-4 font-bold">Status</th>
              <th className="pb-4 px-4 font-bold">Skor Akhir</th>
              <th className="pb-4 px-4 font-bold text-center">Detail Jawaban (B/S)</th>
              <th className="pb-4 px-4 font-bold">Progress</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((row) => (
              <tr key={row.studentId} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30 transition-colors group">
                <td className="py-4 px-4">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">{row.studentName}</div>
                  <div className="text-xs text-zinc-400 font-normal">{row.studentEmail}</div>
                </td>
                
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-tight uppercase ${row.hasAttempted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.hasAttempted ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                    {row.hasAttempted ? 'Selesai' : 'Belum'}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className={`text-lg font-black ${row.hasAttempted ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-300 dark:text-zinc-700'}`}>
                    {row.hasAttempted ? Math.round(row.score) : '--'}
                  </div>
                </td>

                <td className="py-4 px-4 text-center">
                  {row.hasAttempted ? (
                    <div className="inline-flex items-center justify-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-emerald-600">{row.correctAnswers}</span>
                      </div>
                      <div className="w-px h-3 bg-zinc-300 dark:bg-zinc-700"></div>
                      <div className="flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-bold text-rose-600">{row.incorrectAnswers}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-300 dark:text-zinc-700">-</span>
                  )}
                </td>

                <td className="py-4 px-4">
                  {row.hasAttempted ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden min-w-[80px]">
                        <div 
                          className={`h-full transition-all duration-1000 ${row.score >= 75 ? 'bg-emerald-500' : row.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${row.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-500 w-8">{row.completionPercentage}%</span>
                    </div>
                  ) : (
                    <span className="text-zinc-300 dark:text-zinc-700">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <BarChart3 className="w-12 h-12 text-zinc-200 dark:text-zinc-800" />
            <p className="text-zinc-500 font-medium">Data siswa belum tersedia di kelas ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}