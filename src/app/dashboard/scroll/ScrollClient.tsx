"use client";

import React, { useState, useEffect, useRef } from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { uploadContributionFile } from "./_actions/upload";
import { toast } from "sonner";
import { Loader2, Upload, FileText, File as FileIcon, Image as ImageIcon, ThumbsUp, Sparkles, Filter } from "lucide-react";

export default function ScrollClient({ classes, currentUser }: { classes: any[], currentUser: any }) {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [contributions, setContributions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContributions(selectedClass);
  }, [selectedClass]);

  const fetchContributions = async (classId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/contributions?classId=${classId}`);
      if (!res.ok) throw new Error("Gagal mengambil data sumbangan materi");
      const data = await res.json();
      setContributions(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (selectedClass === "all") {
      toast.warning("Pilih kelas spesifik terlebih dahulu sebelum mengunggah materi.");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      toast.info("1/2: Mengunggah file ke satelit...");
      const result = await uploadContributionFile(formData);

      toast.info("2/2: Menyimpan data kontribusi...");
      const dbRes = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.fileName,
          description: "Materi otomatis terdeteksi",
          fileUrl: result.publicUrl,
          fileType: result.fileType,
          classId: selectedClass,
        }),
      });

      if (!dbRes.ok) throw new Error("Gagal menyimpan kontribusi");

      toast.success("Materi berhasil diterbangkan ke Floating Scroll!");
      // Trigger spark effect or similar if needed visually
      fetchContributions(selectedClass);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan sistem");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleVote = async (id: string, currentVoted: boolean) => {
    try {
      // Optimistic upvote Update
      setContributions(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            upvotes: currentVoted ? c.upvotes - 1 : c.upvotes + 1,
            votes: currentVoted ? [] : [{ userId: currentUser.id }]
          };
        }
        return c;
      }));

      const res = await fetch(`/api/contributions/${id}/vote`, { method: "POST" });
      if (!res.ok) throw new Error("Vote gagal");
    } catch (error) {
      // Revert if failed
      fetchContributions(selectedClass); 
      toast.error("Gagal memberikan Insight.");
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-indigo-500" />
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full max-w-md group">
          <BackgroundGradient className="rounded-[22px] max-w-sm p-1 bg-white dark:bg-zinc-900" containerClassName="w-full">
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl cursor-pointer bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-indigo-500 mb-2 group-hover:animate-pulse" />
                    <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold">Klik</span> atau drop file materi
                    </p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileDrop} 
                disabled={isUploading} 
                ref={fileInputRef}
              />
            </label>
          </BackgroundGradient>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        ) : contributions.length === 0 ? (
           <div className="col-span-full text-center py-20 text-zinc-500">
             Belum ada sumbangan materi di zona ini. Jadilah yang pertama!
           </div>
        ) : (
          contributions.map((item) => {
            const hasVoted = item.votes?.some((v: any) => v.userId === currentUser.id);
            return (
              <CardContainer key={item.id} className="inter-var">
                <CardBody className="bg-zinc-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-indigo-500/10 dark:bg-zinc-900 dark:border-white/20 border-black/10 w-full max-w-88 h-auto rounded-xl p-6 border">
                  <CardItem
                    translateZ="50"
                    className="text-xl font-bold text-zinc-800 dark:text-white mb-2 line-clamp-1 truncate block w-full"
                  >
                    {item.title}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="60"
                    className="text-zinc-500 text-sm max-w-sm mt-2 dark:text-zinc-300 line-clamp-2"
                  >
                    Materi diunggah oleh {item.uploader?.name || "Anonim"}
                  </CardItem>
                  <CardItem translateZ="100" className="w-full mt-6 flex justify-center py-8">
                    {item.fileType === "pdf" ? <FileText className="w-20 h-20 text-red-500" /> 
                      : item.fileType === "image" ? <ImageIcon className="w-20 h-20 text-emerald-500" /> 
                      : <FileIcon className="w-20 h-20 text-indigo-500" />}
                  </CardItem>
                  
                  <div className="flex justify-between items-center mt-6">
                    <CardItem
                      translateZ={20}
                      as="a"
                      href={item.fileUrl}
                      target="_blank"
                      className="px-4 py-2 rounded-xl text-xs font-normal dark:text-white bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 transition-colors"
                    >
                      Buka Materi 🚀
                    </CardItem>
                    <CardItem
                      translateZ={20}
                      as="button"
                      onClick={() => handleVote(item.id, hasVoted)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-colors ${
                        hasVoted ? "bg-indigo-600 shadow-md shadow-indigo-500/30" : "bg-black dark:bg-white dark:text-black hover:bg-zinc-800"
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      {item.upvotes} Insight
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            );
          })
        )}
      </div>
    </div>
  );
}
