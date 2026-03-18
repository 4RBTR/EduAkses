"use client";

import { useState, useMemo } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Bell,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  Star,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createPersonalEvent, updatePersonalEvent, deletePersonalEvent } from "@/app/dashboard/_actions/personal-events";
import { updateSchedule, deleteSchedule } from "@/app/actions/calendar";
import { useRouter } from "next/navigation";

type CalendarEvent = {
  id: string;
  title: string;
  type: "ASSIGNMENT" | "SCHEDULE" | "NOTIFICATION" | "HOLIDAY" | "PERSONAL";
  date: Date;
  startTime?: string;
  endTime?: string;
  classId: string;
  className: string;
  description?: string | null;
  dayOfWeek?: number; // for recurring
};

interface CalendarProps {
  fixedEvents: CalendarEvent[];
  recurringEvents: CalendarEvent[];
  userRole?: string;
}

export default function Calendar({ fixedEvents, recurringEvents, userRole }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [newEventDayOfWeek, setNewEventDayOfWeek] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = useMemo(() => {
    const totalDays = daysInMonth(year, month);
    const startOffset = firstDayOfMonth(year, month);
    const calendarDays = [];

    // Padding for previous month
    for (let i = 0; i < startOffset; i++) {
      calendarDays.push({ day: 0, current: false });
    }

    // Days of current month
    for (let i = 1; i <= totalDays; i++) {
        const dateStr = new Date(year, month, i).toDateString();
        const dailyFixed = fixedEvents.filter(e => new Date(e.date).toDateString() === dateStr);
        const dayOfWeek = new Date(year, month, i).getDay();
        const dailyRecurring = recurringEvents.filter(e => e.dayOfWeek === dayOfWeek);
        
      calendarDays.push({ 
        day: i, 
        current: true,
        events: [...dailyFixed, ...dailyRecurring]
      });
    }

    return calendarDays;
  }, [year, month, fixedEvents, recurringEvents]);

  const typeStyles = {
    ASSIGNMENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
    SCHEDULE: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border-primary/20",
    NOTIFICATION: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
    HOLIDAY: "bg-red-500 text-white border-red-600 shadow-sm",
    PERSONAL: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-200"
  };

  const typeIcons = {
    ASSIGNMENT: <Clock className="w-3 h-3" />,
    SCHEDULE: <BookOpen className="w-3 h-3" />,
    NOTIFICATION: <Bell className="w-3 h-3" />,
    HOLIDAY: <Star className="w-3 h-3 fill-white" />,
    PERSONAL: <Star className="w-3 h-3" />
  };

  const handleCreatePersonalEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle || !newEventDate) return;

    setIsSubmitting(true);
    try {
      await createPersonalEvent({
        title: newEventTitle,
        description: newEventDesc,
        date: new Date(newEventDate),
        startTime: newEventStartTime || null,
        endTime: newEventEndTime || null,
        color: "purple"
      });
      setIsAddingEvent(false);
      setNewEventTitle("");
      setNewEventDesc("");
      setNewEventDate("");
      setNewEventStartTime("");
      setNewEventEndTime("");
      router.refresh(); // Refresh payload so new event gets fetched
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setIsSubmitting(true);
    try {
      if (selectedEvent.type === "PERSONAL") {
        await updatePersonalEvent(selectedEvent.id, {
          title: newEventTitle,
          description: newEventDesc,
          date: new Date(newEventDate),
          startTime: newEventStartTime || null,
          endTime: newEventEndTime || null,
        });
      } else if (selectedEvent.type === "SCHEDULE") {
        await updateSchedule(selectedEvent.id, {
          subject: newEventTitle,
          dayOfWeek: newEventDayOfWeek,
          startTime: newEventStartTime,
          endTime: newEventEndTime,
        });
      }
      setIsEditingEvent(false);
      setSelectedEvent(null);
      router.refresh();
    } catch (error) {
       console.error(error);
    } finally {
       setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !confirm("Yakin ingin menghapus event ini?")) return;
    setIsSubmitting(true);
    try {
      if (selectedEvent.type === "PERSONAL") {
        await deletePersonalEvent(selectedEvent.id);
      } else if (selectedEvent.type === "SCHEDULE") {
        await deleteSchedule(selectedEvent.id);
      }
      setSelectedEvent(null);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditMode = () => {
    if (!selectedEvent) return;
    setNewEventTitle(selectedEvent.title);
    setNewEventDesc(selectedEvent.description || "");
    if (selectedEvent.date) setNewEventDate(selectedEvent.date.toISOString().split('T')[0]);
    setNewEventStartTime(selectedEvent.startTime || "");
    setNewEventEndTime(selectedEvent.endTime || "");
    setNewEventDayOfWeek(selectedEvent.dayOfWeek || 1);
    setIsEditingEvent(true);
  };


  return (
    <div className="bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Calendar Header */}
      <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-primary text-white rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
              {monthNames[month]} {year}
              <button 
                onClick={() => setIsAddingEvent(true)}
                className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 text-xs rounded-lg hover:opacity-80 transition"
              >
                <Plus className="w-3 h-3" /> Personal Event
              </button>
            </h2>
            <p className="hidden sm:block text-xs text-zinc-500 font-medium">Agenda Belajar Terpadu</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 sm:p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Hari Ini
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 sm:p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Days Legend */}
      <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/30">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, i) => (
          <div key={d} className={cn(
            "py-2 sm:py-3 text-center text-[8px] sm:text-[10px] font-black uppercase tracking-widest sm:tracking-[0.2em]",
            i === 0 || i === 6 ? "text-red-500" : "text-zinc-500 dark:text-zinc-400"
          )}>
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const isToday = new Date().toDateString() === new Date(year, month, d.day).toDateString();
          const isSunday = (i % 7 === 0);
          const hasHoliday = d.events?.some(e => e.type === "HOLIDAY");
          const isRedDay = isSunday || hasHoliday;

          return (
            <div 
              key={i} 
              className={cn(
                "min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors",
                d.current ? "bg-white dark:bg-zinc-950" : "bg-zinc-50/50 dark:bg-zinc-900/50",
                (i + 1) % 7 === 0 && "border-r-0"
              )}
            >
              {d.day > 0 && (
                <div className="space-y-1">
                  <span className={cn(
                    "flex w-7 h-7 items-center justify-center rounded-lg text-sm font-bold mb-1",
                    isToday
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : isRedDay ? "text-red-500 font-black" : "text-zinc-500"
                  )}>
                    {d.day}
                  </span>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {d.events?.map((e) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className={cn(
                          "w-full text-left px-2 py-1 rounded-md text-[10px] font-bold border truncate hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-1.5",
                          typeStyles[e.type]
                        )}
                      >
                        {typeIcons[e.type]}
                        <span className="truncate">{e.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  selectedEvent.type === "HOLIDAY" ? "bg-red-500 text-white border-red-600" : typeStyles[selectedEvent.type]
                )}>
                  {selectedEvent.type === "HOLIDAY" ? "Libur Nasional" : selectedEvent.type}
                </span>
                <button 
                  onClick={() => { setSelectedEvent(null); setIsEditingEvent(false); }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                >
                  <X size={20} className="text-zinc-400" />
                </button>
              </div>

              {!isEditingEvent ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 leading-tight">
                        {selectedEvent.title}
                      </h3>
                  {selectedEvent.className && (
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <CheckCircle2 size={16} />
                      {selectedEvent.className}
                    </div>
                  )}
                  {selectedEvent.type === "HOLIDAY" && (
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm">
                      <Star size={16} className="fill-red-500" />
                      Tanggal Merah
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Waktu</p>
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
                       <Clock size={16} className="text-zinc-400" />
                       {selectedEvent.type === "SCHEDULE" 
                          ? `${selectedEvent.startTime} - ${selectedEvent.endTime}`
                          : selectedEvent.date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                       }
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tanggal</p>
                    <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold">
                       <CalendarIcon size={16} className="text-zinc-400" />
                       {selectedEvent.date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {selectedEvent.description && (
                  <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={12} />
                      Detail Informasi
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                      "{selectedEvent.description}"
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                 {(selectedEvent.type === "PERSONAL" || 
                   (selectedEvent.type === "SCHEDULE" && (userRole === "TEACHER" || userRole === "CLASS_LEADER"))) && (
                    <>
                      <button
                        onClick={openEditMode}
                        className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 border transition-all"
                      >
                         Edit Event
                      </button>
                      <button
                        onClick={handleDeleteEvent}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 border border-red-200 transition-all disabled:opacity-50"
                      >
                         Hapus Event
                      </button>
                    </>
                 )}
                 <button
                   onClick={() => setSelectedEvent(null)}
                   className="flex-2 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black rounded-xl hover:shadow-2xl hover:shadow-primary/20 transition-all active:scale-95"
                 >
                   Tutup Agenda
                 </button>
              </div>
              </>
              ) : (
                <form onSubmit={handleUpdateEvent} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Judul Event *</label>
                    <input 
                      type="text" 
                      required 
                      value={newEventTitle}
                      onChange={e => setNewEventTitle(e.target.value)}
                      className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {selectedEvent.type === "PERSONAL" && (
                    <div>
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Tanggal *</label>
                      <input 
                        type="date" 
                        required 
                        value={newEventDate}
                        onChange={e => setNewEventDate(e.target.value)}
                        className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  {selectedEvent.type === "SCHEDULE" && (
                    <div>
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Hari ke (0=Minggu, 1=Senin..)</label>
                      <input 
                        type="number" 
                        required 
                        min={0} max={6}
                        value={newEventDayOfWeek}
                        onChange={e => setNewEventDayOfWeek(Number(e.target.value))}
                        className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}
  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Waktu Mulai</label>
                       <input 
                         type="time" 
                         value={newEventStartTime}
                         onChange={e => setNewEventStartTime(e.target.value)}
                         className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                       />
                     </div>
                     <div>
                       <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Waktu Selesai</label>
                       <input 
                         type="time" 
                         value={newEventEndTime}
                         onChange={e => setNewEventEndTime(e.target.value)}
                         className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                       />
                     </div>
                  </div>
  
                  {selectedEvent.type === "PERSONAL" && (
                    <div>
                      <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Deskripsi (Opsional)</label>
                      <textarea 
                        rows={3}
                        value={newEventDesc}
                        onChange={e => setNewEventDesc(e.target.value)}
                        className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                      type="button"
                      onClick={() => setIsEditingEvent(false)}
                      className="flex-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold py-3 rounded-xl border hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Personal Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-4xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                   <Star className="w-5 h-5 text-purple-500 fill-purple-500" />
                   Buat Personal Event
                </h3>
                <button onClick={() => setIsAddingEvent(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                   <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePersonalEvent} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Judul Event *</label>
                  <input 
                    type="text" 
                    required 
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Contoh: Belajar Matematika" 
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Tanggal *</label>
                  <input 
                    type="date" 
                    required 
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Waktu Mulai</label>
                     <input 
                       type="time" 
                       value={newEventStartTime}
                       onChange={e => setNewEventStartTime(e.target.value)}
                       className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                   </div>
                   <div>
                     <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Waktu Selesai</label>
                     <input 
                       type="time" 
                       value={newEventEndTime}
                       onChange={e => setNewEventEndTime(e.target.value)}
                       className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                   </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Deskripsi (Opsional)</label>
                  <textarea 
                    rows={3}
                    value={newEventDesc}
                    onChange={e => setNewEventDesc(e.target.value)}
                    className="mt-1 w-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tambahkan catatan..." 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-4 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Event"}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
