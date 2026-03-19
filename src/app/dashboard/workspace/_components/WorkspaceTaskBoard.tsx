"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  MoreHorizontal, 
  ChevronDown, 
  User as UserIcon, 
  Calendar, 
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlayCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateNote, createNote, deleteNote } from "../_actions/notes";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface UserPIC {
  id: string;
  name: string;
  avatar: string | null;
}

interface WorkspaceNote {
  id: string;
  title: string;
  icon: string | null;
  stage: string;
  role: string;
  activityType: string;
  startDate: Date | null;
  deadline: Date | null;
  picId: string | null;
  pic?: UserPIC | null;
  updatedAt: Date;
}

interface Props {
  initialNotes: WorkspaceNote[];
  allUsers: UserPIC[];
  currentUserId: string;
}

const STAGES = [
  { label: "Backlog", color: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", icon: AlertCircle },
  { label: "Pra-Produksi", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", icon: Clock },
  { label: "Produksi", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", icon: PlayCircle },
  { label: "Final", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", icon: CheckCircle2 },
];

const ACTIVITIES = ["Task", "Script", "Observation"];

export function WorkspaceTaskBoard({ initialNotes, allUsers, currentUserId }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState<WorkspaceNote[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<{ id: string; type: "stage" | "pic" | "activity" } | null>(null);

  // Realtime Sync
  useEffect(() => {
    const channel = supabase
      .channel("public:workspace_notes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspace_notes", filter: `userId=eq.${currentUserId}` },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            setNotes(prev => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setNotes(prev => prev.map(n => n.id === payload.new.id ? { ...n, ...payload.new } : n));
          } else if (payload.eventType === "DELETE") {
            setNotes(prev => prev.filter(n => n.id === payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  // Sync state ONLY if props change externally
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const handleUpdate = async (id: string, data: Partial<WorkspaceNote>) => {
    try {
      // Optimistic update
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...data } : n));
      await updateNote(id, data as any);
      // toast.success("Terupdate");
    } catch {
      toast.error("Gagal update data");
      router.refresh();
    }
  };

  const handleCreate = async () => {
    try {
      const data = await createNote();
      router.push(`/dashboard/workspace/${data.id}`);
    } catch {
      toast.error("Gagal membuat tugas baru");
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.stage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Master Task Board</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none w-64"
            />
          </div>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Baru
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="sticky top-0 bg-white dark:bg-zinc-950 z-10">
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[40px] text-center">Icon</th>
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider min-w-[200px]">Task Name</th>
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[150px]">Jenis Kegiatan</th>
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[150px]">PIC</th>
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[120px]">Role</th>
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[150px]">Aktivitas</th>
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[140px]">Start Date</th>
              <th className="px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider w-[140px]">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
            {filteredNotes.map((note) => {
              const stage = STAGES.find(s => s.label === note.stage) || STAGES[0];
              const StageIcon = stage.icon;

              return (
                <tr key={note.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                  {/* Icon */}
                  <td className="px-4 py-3 text-center">
                    <span className="text-xl cursor-default">{note.icon}</span>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => router.push(`/dashboard/workspace/${note.id}`)}
                      className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline hover:text-primary transition-colors block w-full text-left truncate"
                    >
                      {note.title}
                    </button>
                  </td>

                  {/* Stage Dropdown */}
                  <td className="px-4 py-3 relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown?.id === note.id && activeDropdown?.type === "stage" ? null : { id: note.id, type: "stage" })}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold transition-all",
                        stage.color
                      )}
                    >
                      <StageIcon className="w-3 h-3" />
                      {note.stage}
                      <ChevronDown className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100" />
                    </button>
                    {activeDropdown?.id === note.id && activeDropdown.type === "stage" && (
                      <div className="absolute top-12 left-4 z-20 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1 animate-in fade-in slide-in-from-top-2">
                        {STAGES.map(s => (
                          <button
                            key={s.label}
                            onClick={() => {
                              handleUpdate(note.id, { stage: s.label });
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            <s.icon className="w-3.5 h-3.5" />
                            {s.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* PIC Select */}
                  <td className="px-4 py-3 relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown?.id === note.id && activeDropdown?.type === "pic" ? null : { id: note.id, type: "pic" })}
                      className="flex items-center gap-2 group/pic"
                    >
                      {note.pic?.avatar ? (
                        <img src={note.pic.avatar} className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-800" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                          <UserIcon size={12} className="text-zinc-400" />
                        </div>
                      )}
                      <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[80px]">
                        {note.pic?.name || "Assign"}
                      </span>
                    </button>
                    {activeDropdown?.id === note.id && activeDropdown.type === "pic" && (
                      <div className="absolute top-12 left-4 z-20 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1 animate-in fade-in slide-in-from-top-2 max-h-60 overflow-y-auto">
                        <div className="px-3 py-2 mb-1 border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 tracking-wider">PILIH PIC</div>
                        {allUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              handleUpdate(note.id, { picId: u.id, pic: u });
                              setActiveDropdown(null);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                             {u.avatar ? (
                                <img src={u.avatar} className="w-5 h-5 rounded-full" alt="" />
                              ) : (
                                <UserIcon size={12} />
                              )}
                            {u.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      defaultValue={note.role}
                      onBlur={(e) => handleUpdate(note.id, { role: e.target.value })}
                      className="w-full text-xs text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded border-transparent focus:border-purple-300 dark:focus:border-purple-800 outline-none"
                    />
                  </td>

                  {/* Activity Type Dropdown */}
                  <td className="px-4 py-3 relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown?.id === note.id && activeDropdown?.type === "activity" ? null : { id: note.id, type: "activity" })}
                      className="text-[11px] px-2 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 font-semibold"
                    >
                      {note.activityType}
                    </button>
                    {activeDropdown?.id === note.id && activeDropdown.type === "activity" && (
                      <div className="absolute top-10 left-4 z-20 w-32 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1">
                        {ACTIVITIES.map(a => (
                          <button
                            key={a}
                            onClick={() => {
                              handleUpdate(note.id, { activityType: a });
                              setActiveDropdown(null);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Start Date */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      <input 
                        type="date" 
                        defaultValue={note.startDate ? format(new Date(note.startDate), "yyyy-MM-dd") : ""}
                        onChange={(e) => handleUpdate(note.id, { startDate: e.target.value ? new Date(e.target.value) : null })}
                        className="bg-transparent outline-none cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                      />
                    </div>
                  </td>

                  {/* Deadline */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      <input 
                        type="date" 
                        defaultValue={note.deadline ? format(new Date(note.deadline), "yyyy-MM-dd") : ""}
                        onChange={(e) => handleUpdate(note.id, { deadline: e.target.value ? new Date(e.target.value) : null })}
                        className="bg-transparent outline-none cursor-pointer hover:text-red-500 font-medium"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <Search className="text-zinc-300" />
            </div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Belum ada tugas</p>
            <p className="text-xs text-zinc-500 mt-1">Buat tugas baru untuk memulai kolaborasi.</p>
          </div>
        )}
      </div>

      {/* Click outside to close active dropdown */}
      {activeDropdown && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
}
