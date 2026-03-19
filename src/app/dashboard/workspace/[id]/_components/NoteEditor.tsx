"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateNote, deleteNote } from "../../_actions/notes";
import { ArrowLeft, Trash2, Pin, Image as ImageIcon, Loader2, Clock, PlayCircle, User as UserIcon, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EMOJIS = ["📝", "📚", "🧠", "💡", "🎯", "✅", "🔥", "🌟", "📌", "🗒️", "💬", "🚀", "🌈", "🎨", "🔑"];

type Note = {
  id: string;
  title: string;
  content: string | null;
  coverUrl: string | null;
  icon: string | null;
  isPinned: boolean;
  stage: string;
  role: string;
  activityType: string;
  startDate: Date | null;
  deadline: Date | null;
  picId: string | null;
};

interface Props {
  note: Note;
}

export function NoteEditor({ note }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(note.title || "Untitled");
  const [content, setContent] = useState(note.content || "");
  const [coverUrl, setCoverUrl] = useState(note.coverUrl || "");
  const [icon, setIcon] = useState(note.icon || "📝");
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [stage, setStage] = useState(note.stage || "Backlog");
  const [role, setRole] = useState(note.role || "Member");
  const [activityType, setActivityType] = useState(note.activityType || "Task");
  const [startDate, setStartDate] = useState<string>(note.startDate ? new Date(note.startDate).toISOString().split('T')[0] : "");
  const [deadline, setDeadline] = useState<string>(note.deadline ? new Date(note.deadline).toISOString().split('T')[0] : "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [showCoverInput, setShowCoverInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [coverInputVal, setCoverInputVal] = useState(note.coverUrl || "");
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  const save = useCallback(async (overrides?: Partial<Note>) => {
    setIsSaving(true);
    try {
      await updateNote(note.id, {
        title: overrides?.title ?? title,
        content: overrides?.content ?? content,
        coverUrl: overrides?.coverUrl !== undefined ? overrides.coverUrl : coverUrl || null,
        icon: overrides?.icon ?? icon,
        isPinned: overrides?.isPinned ?? isPinned,
        stage: overrides?.stage ?? stage,
        role: overrides?.role ?? role,
        activityType: overrides?.activityType ?? activityType,
        startDate: overrides?.startDate !== undefined ? (overrides.startDate ? new Date(overrides.startDate) : null) : (startDate ? new Date(startDate) : null),
        deadline: overrides?.deadline !== undefined ? (overrides.deadline ? new Date(overrides.deadline) : null) : (deadline ? new Date(deadline) : null),
      });
    } catch {
      toast.error("Gagal menyimpan catatan.");
    } finally {
      setIsSaving(false);
    }
  }, [note.id, title, content, coverUrl, icon, isPinned, stage, role, activityType, startDate, deadline]);

  // Debounced auto-save
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(), 1500);
  }, [save]);

  useEffect(() => scheduleSave(), [title, content, stage, role, activityType, startDate, deadline, scheduleSave]);

  const handleDelete = async () => {
    if (!confirm("Hapus catatan ini?")) return;
    await deleteNote(note.id);
    router.push("/dashboard/workspace");
    router.refresh();
  };

  const handlePin = async () => {
    const next = !isPinned;
    setIsPinned(next);
    await save({ isPinned: next });
    toast.success(next ? "Catatan di-pin!" : "Pin dilepas.");
  };

  const handleCoverApply = async () => {
    setCoverUrl(coverInputVal);
    setShowCoverInput(false);
    await updateNote(note.id, { coverUrl: coverInputVal || null });
  };

  const handleIconPick = async (emoji: string) => {
    setIcon(emoji);
    setShowEmojiPicker(false);
    await updateNote(note.id, { icon: emoji });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 flex flex-col">
      {/* Topbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md">
        <button
          onClick={() => router.push("/dashboard/workspace")}
          className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>
        <div className="flex items-center gap-3">
          {isSaving && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menyimpan...</span>
            </div>
          )}
          <button
            onClick={handlePin}
            className={cn("p-2 rounded-lg transition-colors", isPinned ? "text-primary bg-primary/10" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800")}
            title={isPinned ? "Unpin" : "Pin catatan"}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            title="Hapus catatan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cover Image */}
      {coverUrl ? (
        <div className="relative h-52 md:h-72 overflow-hidden group">
          <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-end justify-end p-4 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setShowCoverInput(true)}
              className="px-3 py-1.5 bg-white/90 dark:bg-zinc-900/90 rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 hover:bg-white transition-colors shadow"
            >
              <ImageIcon className="w-3.5 h-3.5" /> Ganti Cover
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 md:px-20 pt-8">
          <button
            onClick={() => setShowCoverInput(true)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5" /> Tambah Cover
          </button>
        </div>
      )}

      {/* Cover URL Input Modal */}
      {showCoverInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowCoverInput(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-5 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">URL Gambar Cover</p>
            <p className="text-xs text-zinc-500 mb-3">Masukkan URL gambar dari Unsplash, Google Drive (link langsung), atau lainnya.</p>
            <input
              type="url"
              value={coverInputVal}
              onChange={(e) => setCoverInputVal(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary mb-3"
            />
            <div className="flex gap-2">
              <button onClick={handleCoverApply} className="flex-1 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity">Terapkan</button>
              {coverUrl && (
                <button onClick={() => { setCoverUrl(""); setCoverInputVal(""); setShowCoverInput(false); updateNote(note.id, { coverUrl: null }); }}
                  className="px-4 py-2 text-sm font-semibold text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                  Hapus
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metadata Section (Notion-style) */}
      <div className="px-6 md:px-20 pt-8 max-w-4xl mx-auto w-full space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 py-6 border-b border-zinc-100 dark:border-zinc-800">
          {/* Stage Selection */}
          <div className="flex items-center gap-4 group">
            <div className="w-24 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              Stage
            </div>
            <select 
              value={stage}
              onChange={(e) => { setStage(e.target.value); save({ stage: e.target.value }); }}
              className="flex-1 bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
            >
              <option value="Backlog">Backlog</option>
              <option value="Pra-Produksi">Pra-Produksi</option>
              <option value="Produksi">Produksi</option>
              <option value="Final">Final</option>
            </select>
          </div>

          {/* Activity Type */}
          <div className="flex items-center gap-4 group">
            <div className="w-24 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <PlayCircle className="w-3.5 h-3.5" />
              Aktivitas
            </div>
            <select 
              value={activityType}
              onChange={(e) => { setActivityType(e.target.value); save({ activityType: e.target.value }); }}
              className="flex-1 bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
            >
              <option value="Task">Task</option>
              <option value="Script">Script</option>
              <option value="Observation">Observation</option>
            </select>
          </div>

          {/* Role */}
          <div className="flex items-center gap-4 group">
            <div className="w-24 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <UserIcon className="w-3.5 h-3.5" />
              Role
            </div>
            <input 
              type="text"
              value={role}
              placeholder="e.g. Editor, Writer"
              onChange={(e) => setRole(e.target.value)}
              className="flex-1 bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
            />
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-4 group">
            <div className="w-24 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <Calendar className="w-3.5 h-3.5" />
              Start Date
            </div>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); save({ startDate: e.target.value ? new Date(e.target.value) : null } as any); }}
              className="flex-1 bg-transparent text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
            />
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-4 group">
            <div className="w-24 flex items-center gap-2 text-xs font-medium text-zinc-400">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Deadline
            </div>
            <input 
              type="date"
              value={deadline}
              onChange={(e) => { setDeadline(e.target.value); save({ deadline: e.target.value ? new Date(e.target.value) : null } as any); }}
              className="flex-1 bg-transparent text-xs font-semibold text-red-600 dark:text-red-400 outline-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 px-6 md:px-20 pb-32 pt-6 max-w-4xl mx-auto w-full">
        {/* Icon */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowEmojiPicker((v) => !v)}
            className="text-5xl hover:opacity-70 transition-opacity leading-none"
            title="Pilih ikon"
          >
            {icon}
          </button>
          {showEmojiPicker && (
            <div className="absolute top-14 left-0 z-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-3 flex flex-wrap gap-2 w-64">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleIconPick(e)}
                  className="text-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg p-1.5 transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <textarea
          ref={titleRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul..."
          className="w-full text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 bg-transparent outline-none resize-none leading-tight placeholder:text-zinc-300 dark:placeholder:text-zinc-700 mb-6"
          rows={1}
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Mulai menulis... Tekan Enter untuk paragraf baru."
          className="w-full text-zinc-700 dark:text-zinc-300 bg-transparent outline-none resize-none leading-8 text-[15px] placeholder:text-zinc-300 dark:placeholder:text-zinc-700 min-h-[400px]"
        />
      </div>
    </div>
  );
}
