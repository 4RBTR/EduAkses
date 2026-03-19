"use client";

import React, { useState, useEffect } from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Search, Loader2, BookOpen, FileText, Archive as ArchiveIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ArchiveClient() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchArchive(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const fetchArchive = async (q: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/archive?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const Skeleton = () => (
    <div className="flex flex-1 w-full h-full min-h-24 rounded-xl bg-linear-to-br from-neutral-200 dark:from-neutral-900 dark:to-neutral-800 to-neutral-100"></div>
  );

  return (
    <div className="w-full relative pb-20">
      {/* Floating Smart Search Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative max-w-2xl mx-auto mb-12 shadow-2xl dark:shadow-none"
      >
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-indigo-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari materi, tugas, atau file lama..."
          className="block w-full pl-12 pr-4 py-4 rounded-full border-2 border-transparent bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Bento Grid layout */}
      <BentoGrid className="max-w-5xl mx-auto">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9, rotateX: 90 }} // 3D Accordion-style flip in
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
            className={i === 0 || i === 3 ? "md:col-span-2 relative group overflow-hidden" : "md:col-span-1 relative group overflow-hidden"}
          >
             {/* Moving Border Effect logic using simple CSS animation equivalent or background rotate */}
             <div className="absolute inset-0 bg-linear-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-20 animate-spin-slow transition-opacity duration-500 pointer-events-none rounded-xl" style={{ animationDuration: '4s' }}></div>
             
             <BentoGridItem
               title={<a href={item.fileUrl} target="_blank" className="hover:text-indigo-500 transition-colors z-10 relative">{item.title}</a>}
               description={
                 <div className="flex flex-col gap-1 z-10 relative">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 w-fit">
                      {item.type}
                    </span>
                    <span>{item.description}</span>
                    <span className="text-[10px] text-zinc-400 mt-1">{new Date(item.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                 </div>
               }
               header={
                 <div className="flex flex-1 w-full h-full min-h-24 rounded-xl bg-linear-to-br from-indigo-100 dark:from-zinc-800 to-purple-100 dark:to-zinc-900 items-center justify-center relative overflow-hidden">
                    <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 0.5 }} className="perspective-1000">
                      {item.type === "Materi" ? <BookOpen className="w-12 h-12 text-indigo-400" /> : <FileText className="w-12 h-12 text-purple-400" />}
                    </motion.div>
                 </div>
               }
               className="h-full border-zinc-200/50 dark:border-zinc-800/50 shadow-xs group-hover:border-indigo-500/30 transition-all z-0"
             />
          </motion.div>
        ))}
      </BentoGrid>

      {!isLoading && items.length === 0 && (
        <div className="text-center mt-12 text-zinc-500">
           <ArchiveIcon className="w-16 h-16 mx-auto mb-4 text-zinc-300 dark:text-zinc-700" />
           <p>Tidak ada arsip yang ditemukan untuk "{query}".</p>
        </div>
      )}
    </div>
  );
}
