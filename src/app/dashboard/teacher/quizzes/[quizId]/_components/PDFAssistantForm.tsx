"use client";

import { useState, useTransition, useRef } from "react";
import { extractTextFromPdfAction } from "@/app/actions/pdf-assistant";
import { bulkCreateQuestions } from "@/app/actions/bulk-quiz";
import { FileText, Loader2, Info, Check, Copy, Layout, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PDFAssistantForm({ quizId }: { quizId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  
  const [isExtracting, startExtracting] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Silakan unggah file PDF yang valid.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = (error) => reject(error);
    });

  const handleExtract = async () => {
    if (!file) {
      toast.error("Silakan pilih file PDF.");
      return;
    }

    startExtracting(async () => {
      try {
        const base64Pdf = await toBase64(file);
        const result = await extractTextFromPdfAction(base64Pdf);
        
        if (result.error) {
          toast.error(result.error);
        } else if (result.data) {
          setExtractedText(result.data);
          toast.success("Teks berhasil diekstrak!");
        }
      } catch (error) {
        toast.error("Gagal memproses PDF. Silakan coba lagi.");
      }
    });
  };

  const handleSaveAll = async () => {
    if (!questionsText.trim()) {
      toast.error("Kotak pertanyaan masih kosong.");
      return;
    }

    startSaving(async () => {
      const result = await bulkCreateQuestions(quizId, questionsText);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result?.count} soal berhasil ditambahkan!`);
        setExtractedText("");
        setQuestionsText("");
        setIsOpen(false);
        window.location.reload();
      }
    });
  };

  return (
    <div className="bg-linear-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
          <FileText className="w-5 h-5" />
          Asisten PDF Manual
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:underline"
        >
          {isOpen ? "Tutup" : "Buka Asisten"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Step 1: Upload & Extract */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                    <Layout className="w-4 h-4 text-emerald-500" />
                    1. Referensi Materi (PDF)
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all"
                >
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2 text-emerald-600 font-medium">
                      <FileText className="w-8 h-8 opacity-50" />
                      <span className="text-sm truncate max-w-full italic">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-400">
                      <FileText className="w-8 h-8 opacity-30" />
                      <span className="text-sm">Klik untuk pilih file PDF materi</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleExtract}
                  disabled={isExtracting || !file}
                  className="w-full h-11 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
                >
                  {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                  Ekstrak Teks Materi
                </button>

                {extractedText && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-tight">Teks Terdeteksi:</label>
                        <div className="w-full h-48 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-mono whitespace-pre-wrap thin-scrollbar">
                            {extractedText}
                        </div>
                    </div>
                )}
              </div>
            </div>

            {/* Step 2: Write Questions */}
            <div className="space-y-4">
               <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 shadow-sm h-full flex flex-col">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-700 dark:text-zinc-300">
                        <PenLine className="w-4 h-4 text-emerald-500" />
                        2. Tulis Soal (Bulk Format)
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-[10px] text-zinc-500 leading-tight">
                        <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <p>Format: <b>Q:</b> Soal, <b>A:</b> Opsi1, Opsi2... (pisahkan koma), <b>K:</b> Jawaban benar. Pisahkan antar soal dengan baris kosong.</p>
                    </div>

                    <textarea
                        placeholder="Q: Apa itu fotosintesis?&#10;A: Proses masak tumbuhan, Proses tidur, Proses lari, Proses makan&#10;K: Proses masak tumbuhan"
                        className="w-full flex-1 min-h-[250px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                        value={questionsText}
                        onChange={(e) => setQuestionsText(e.target.value)}
                    />

                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving || !questionsText.trim()}
                        className="w-full h-12 bg-primary text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all mt-auto"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        SIMPAN SEMUA KE KUIS
                    </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
