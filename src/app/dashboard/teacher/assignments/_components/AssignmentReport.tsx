"use client";

import { useEffect, useState } from "react";
import { getAssignmentReport } from "../_actions/report";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { Download, FileText, Table } from "lucide-react";

interface ReportItem {
  studentId: string;
  studentName: string;
  studentEmail: string;
  hasSubmitted: boolean;
  submittedAt: Date | null;
  grade: number | null;
  submissionStatus: "ON_TIME" | "LATE" | "LATE_APPROVED" | "BELUM_MENGERJAKAN" | null;
}

export function AssignmentReport({ assignmentId }: { assignmentId: string }) {
  const [data, setData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssignmentReport(assignmentId)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [assignmentId]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Assignment Report", 14, 15);
    
    autoTable(doc, {
      startY: 20,
      head: [["Name", "Status", "Submitted At", "Grade"]],
      body: data.map(item => [
        item.studentName,
        item.hasSubmitted ? "Sudah" : "Belum",
        item.submittedAt ? new Date(item.submittedAt).toLocaleString("id-ID") : "-",
        item.grade !== null ? item.grade.toString() : "-"
      ])
    });

    doc.save(`Assignment_Report_${assignmentId}.pdf`);
  };

  const handleExportCSV = () => {
    const csvData = data.map(item => ({
      "Name": item.studentName,
      "Email": item.studentEmail,
      "Status": item.hasSubmitted ? "Sudah" : "Belum",
      "Submitted At": item.submittedAt ? new Date(item.submittedAt).toLocaleString("id-ID") : "-",
      "Grade": item.grade !== null ? item.grade : "-"
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Assignment_Report_${assignmentId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-4 text-center">Loading Report...</div>;

  return (
    <div className="mt-8 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
          <Table className="w-5 h-5" />
          Assignment Report
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
              <th className="pb-3 px-4 font-medium">Status</th>
              <th className="pb-3 px-4 font-medium">Status Waktu</th>
              <th className="pb-3 px-4 font-medium">Submitted At</th>
              <th className="pb-3 px-4 font-medium">Grade</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((row) => (
              <tr key={row.studentId} className="border-b border-zinc-100 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 transition-colors">
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.studentName}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.hasSubmitted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                    {row.hasSubmitted ? 'Sudah Mengerjakan' : 'Belum Mengerjakan'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {row.hasSubmitted && row.submissionStatus && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      row.submissionStatus === 'ON_TIME'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : row.submissionStatus === 'LATE_APPROVED'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : row.submissionStatus === 'LATE'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                      {row.submissionStatus === 'ON_TIME' ? '✓ Tepat Waktu' : row.submissionStatus === 'LATE_APPROVED' ? '⚠ Disetujui Telat' : row.submissionStatus === 'LATE' ? '✗ Terlambat' : 'Belum Mengerjakan'}
                    </span>
                  )}
                  {!row.hasSubmitted && (
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                      -
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                  {row.submittedAt ? new Date(row.submittedAt).toLocaleString('id-ID') : '-'}
                </td>
                <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-100">
                  {row.grade !== null ? row.grade : '-'}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-500 dark:text-zinc-400">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
