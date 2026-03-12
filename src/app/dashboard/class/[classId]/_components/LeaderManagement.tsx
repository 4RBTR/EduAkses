"use client";

import { useState, useTransition } from "react";
import { manageSchedule, postAnnouncement } from "@/app/actions/leader";
import { 
  Calendar, 
  Bell, 
  Plus, 
  Loader2, 
  CheckCircle,
  Clock,
  MessageSquare
} from "lucide-react";

interface LeaderManagementProps {
  classId: string;
}

export function LeaderManagement({ classId }: LeaderManagementProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"schedule" | "announcement">("schedule");
  const [success, setSuccess] = useState(false);

  // Schedule Form State
  const [subject, setSubject] = useState("");
  const [day, setDay] = useState("1");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("09:30");

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");

  const handleAddSchedule = () => {
    if (!subject) return alert("Pelajaran wajib diisi");
    startTransition(async () => {
      const res = await manageSchedule(classId, subject, parseInt(day), start, end);
      if (res.success) {
        setSuccess(true);
        setSubject("");
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  const handlePostAnnouncement = () => {
    if (!annTitle || !annMessage) return alert("Judul dan pesan wajib diisi");
    startTransition(async () => {
      const res = await postAnnouncement(classId, annTitle, annMessage);
      if (res.success) {
        setSuccess(true);
        setAnnTitle("");
        setAnnMessage("");
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-4xl p-8 shadow-2xl space-y-8 h-full">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-6">
         <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 italic tracking-tight uppercase flex items-center gap-3">
            <Plus className="w-5 h-5 text-primary" />
            Panel Komando
         </h3>
         <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("schedule")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "schedule" ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-zinc-400"}`}
            >
              Jadwal
            </button>
            <button 
              onClick={() => setActiveTab("announcement")}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "announcement" ? "bg-white dark:bg-zinc-800 shadow-sm text-primary" : "text-zinc-400"}`}
            >
              Capaian
            </button>
         </div>
      </div>

      {activeTab === "schedule" ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
           <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Mata Pelajaran</label>
              <input 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Matematika Diskrit"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
              />
           </div>
           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Hari</label>
                <select 
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="1">Senin</option>
                  <option value="2">Selasa</option>
                  <option value="3">Rabu</option>
                  <option value="4">Kamis</option>
                  <option value="5">Jumat</option>
                  <option value="6">Sabtu</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Mulai</label>
                <input 
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Selesai</label>
                <input 
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
           </div>
           <button 
            onClick={handleAddSchedule}
            disabled={isPending}
            className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
           >
             {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : success ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Calendar className="w-4 h-4" />}
             {success ? "Berhasil Ditambahkan" : "Update Jadwal"}
           </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
           <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Subjek Pengumuman</label>
              <input 
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Contoh: Reminder Tugas Fisika"
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all"
              />
           </div>
           <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-1">Pesan Lengkap</label>
              <textarea 
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="Siswa yang belum mengumpulkan segera ya..."
                className="w-full h-32 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
           </div>
           <button 
            onClick={handlePostAnnouncement}
            disabled={isPending}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-lg disabled:opacity-50"
           >
             {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : success ? <CheckCircle className="w-4 h-4 text-white" /> : <Bell className="w-4 h-4" />}
             {success ? "Terkirim Ke Dashboard" : "Siarkan Pengumuman"}
           </button>
        </div>
      )}

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
         <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
            * Perubahan jadwal dan pengumuman akan langsung muncul di Papan Pengumuman setiap siswa di kelas ini.
         </p>
      </div>
    </div>
  );
}
