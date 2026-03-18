"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getDMs, sendDM } from "../_actions/dm";
import { getGroupMessages, sendGroupMessage, createGroup, searchUsersForGroup } from "../_actions/groups";
import { uploadChatFile } from "../_actions/upload";
import {
  Send, Loader2, User as UserIcon, Users, Search, MessageSquare,
  Paperclip, CheckCheck, Check, Image, FileText, Plus, X
} from "lucide-react";
import { toast } from "sonner";

type Contact = {
  id: string; name: string; email: string; role: string; avatar?: string | null;
};
type Group = {
  id: string; name: string; creatorId: string;
  members: Array<{ id: string; userId: string; user: { id: string; name: string; avatar?: string | null } }>;
  messages: Array<{ id: string; createdAt: Date; sender: { name: string } } & { content: string | null }>;
};
type BaseMsg = {
  id: string; content?: string | null; attachmentUrl?: string | null; attachmentType?: string | null;
  createdAt: Date; sender: { id: string; name: string; avatar?: string | null };
};

interface ChatLayoutProps {
  currentUserId: string;
  currentUserName: string;
  contacts: Contact[];
  groups: Group[];
}

export function ChatLayout({ currentUserId, currentUserName, contacts, groups: groupsInit }: ChatLayoutProps) {
  const [activeTab, setActiveTab] = useState<"dm" | "group">("dm");
  const [search, setSearch] = useState("");
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<BaseMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [groups, setGroups] = useState<Group[]>(groupsInit);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<Contact[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Load DM messages
  useEffect(() => {
    if (activeContact) {
      getDMs(activeContact.id).then((msgs) => setMessages(msgs as any));
    }
  }, [activeContact]);

  // Load group messages
  useEffect(() => {
    if (activeGroup) {
      getGroupMessages(activeGroup.id).then((msgs) => setMessages(msgs as any));
    }
  }, [activeGroup]);

  // Group search
  useEffect(() => {
    if (groupSearch.length < 2) { setGroupSearchResults([]); return; }
    const timer = setTimeout(() => {
      searchUsersForGroup(groupSearch).then((r) => setGroupSearchResults(r));
    }, 300);
    return () => clearTimeout(timer);
  }, [groupSearch]);

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputText.trim() && !isUploading) || isSending) return;
    setIsSending(true);
    try {
      if (activeContact) {
        const msg = await sendDM(activeContact.id, inputText.trim()) as any;
        setMessages((prev) => [...prev, msg]);
      } else if (activeGroup) {
        const msg = await sendGroupMessage(activeGroup.id, inputText.trim()) as any;
        setMessages((prev) => [...prev, msg]);
      }
      setInputText("");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("Ukuran file maksimal 10MB"); return; }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { publicUrl, attachmentType } = await uploadChatFile(formData);
      if (activeContact) {
        const msg = await sendDM(activeContact.id, "", publicUrl, attachmentType) as any;
        setMessages((prev: any) => [...prev, msg]);
      } else if (activeGroup) {
        const msg = await sendGroupMessage(activeGroup.id, "", publicUrl, attachmentType) as any;
        setMessages((prev: any) => [...prev, msg]);
      }
    } catch (err: any) {
      toast.error("Gagal upload: " + err.message);
    } finally { setIsUploading(false); }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName || selectedMembers.length === 0) return;
    setIsCreatingGroup(true);
    try {
      await createGroup(newGroupName, selectedMembers.map((m) => m.id));
      setShowCreateGroup(false);
      setNewGroupName("");
      setSelectedMembers([]);
      // Reload groups by re-fetching
      window.location.reload();
    } finally { setIsCreatingGroup(false); }
  };

  const renderMessage = (msg: BaseMsg) => {
    const isMe = msg.sender.id === currentUserId;
    return (
      <div key={msg.id} className={cn("flex w-full gap-2", isMe ? "justify-end" : "justify-start")}>
        {!isMe && (
          <div className="w-7 h-7 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300 mt-auto mb-1">
            {msg.sender.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={cn("max-w-[75%] flex flex-col gap-0.5", isMe ? "items-end" : "items-start")}>
          {!isMe && <span className="text-[10px] text-zinc-500 font-semibold px-1">{msg.sender.name}</span>}
          <div className={cn(
            "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
            isMe ? "bg-primary text-white rounded-br-sm" : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
          )}>
            {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
            {msg.attachmentUrl && msg.attachmentType === "image" && (
              <img src={msg.attachmentUrl} alt="attachment" className="max-w-xs rounded-xl mt-1 cursor-pointer" onClick={() => window.open(msg.attachmentUrl!, '_blank')} />
            )}
            {msg.attachmentUrl && msg.attachmentType === "document" && (
              <a href={msg.attachmentUrl} target="_blank" rel="noreferrer"
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold mt-1 transition-colors",
                  isMe ? "bg-white/20 hover:bg-white/30 text-white" : "bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200")}>
                <FileText className="w-4 h-4" /> Download File
              </a>
            )}
          </div>
          <div className={cn("flex items-center gap-1 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
            <span className="text-[9px] text-zinc-400">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isMe && (
              <span className="text-[9px]">
                {(msg as any).isRead
                  ? <CheckCheck className="w-3 h-3 text-blue-400" />
                  : <Check className="w-3 h-3 text-zinc-400" />
                }
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 shrink-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        {/* Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button onClick={() => setActiveTab("dm")} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors",
            activeTab === "dm" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100")}>
            <MessageSquare className="w-4 h-4" /> Direct
          </button>
          <button onClick={() => setActiveTab("group")} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors",
            activeTab === "group" ? "border-primary text-primary bg-primary/5" : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100")}>
            <Users className="w-4 h-4" /> Grup
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={activeTab === "dm" ? "Cari kontak..." : "Cari grup..."}
              className="bg-transparent text-sm text-zinc-900 dark:text-zinc-100 flex-1 outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Contact / Group List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {activeTab === "dm" ? (
            filteredContacts.length === 0 ? (
              <p className="text-center text-xs text-zinc-400 p-4">Tidak ada kontak ditemukan.</p>
            ) : filteredContacts.map((c) => (
              <button key={c.id} onClick={() => { setActiveContact(c); setActiveGroup(null); setMessages([]); }}
                className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all",
                  activeContact?.id === c.id ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 border border-transparent")}>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">{c.name}</p>
                  <p className="text-[10px] text-zinc-400 capitalize">{c.role.replace("_", " ").toLowerCase()}</p>
                </div>
              </button>
            ))
          ) : (
            <>
              <button onClick={() => setShowCreateGroup(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:border-primary hover:text-primary transition-colors">
                <Plus className="w-4 h-4" /> Buat Grup Baru
              </button>
              {filteredGroups.length === 0 ? (
                <p className="text-center text-xs text-zinc-400 p-4">Belum ada grup.</p>
              ) : filteredGroups.map((g) => (
                <button key={g.id} onClick={() => { setActiveGroup(g); setActiveContact(null); setMessages([]); }}
                  className={cn("w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all",
                    activeGroup?.id === g.id ? "bg-primary/10 border border-primary/20" : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 border border-transparent")}>
                  <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">{g.name}</p>
                    <p className="text-[10px] text-zinc-400">{g.members.length} anggota</p>
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
        {(activeContact || activeGroup) ? (
          <>
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-primary/10 font-bold text-primary text-sm">
                {activeContact ? activeContact.name.charAt(0).toUpperCase() : <Users className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{activeContact?.name || activeGroup?.name}</h3>
                <p className="text-[10px] text-zinc-500">
                  {activeContact ? activeContact.email : `${activeGroup?.members.length} anggota`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400">
                  <MessageSquare className="w-10 h-10 mb-3 text-zinc-300 dark:text-zinc-700" />
                  <p className="text-sm font-medium">Belum ada pesan.</p>
                  <p className="text-xs mt-1">Mulai percakapan sekarang!</p>
                </div>
              )}
              {messages.map(renderMessage)}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx,.xlsx,.pptx"
                onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }} />
              <form onSubmit={handleSend} className="flex items-end gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                </button>
                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-3xl flex items-center px-4 focus-within:ring-2 focus-within:ring-primary transition-shadow">
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Tulis pesan... (Enter untuk kirim)"
                    className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border-0 focus:outline-none resize-none py-3 h-10 overflow-hidden"
                    rows={1} disabled={isSending} />
                </div>
                <button type="submit" disabled={isSending || (!inputText.trim() && !isUploading)}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shrink-0 shadow">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8">
            <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-5">
              <MessageSquare className="w-10 h-10 text-zinc-300 dark:text-zinc-600" />
            </div>
            <h3 className="font-bold text-zinc-700 dark:text-zinc-300 text-lg">Pilih Percakapan</h3>
            <p className="text-sm text-center mt-2 max-w-xs text-zinc-500">
              Pilih kontak di sebelah kiri untuk memulai chat, atau buat grup baru.
            </p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">Buat Grup Baru</h3>
              <button onClick={() => setShowCreateGroup(false)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Nama Grup"
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary" />
            <div>
              <input value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)} placeholder="Cari anggota..."
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-primary" />
              {groupSearchResults.length > 0 && (
                <div className="mt-2 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                  {groupSearchResults.map((u) => (
                    <button key={u.id} onClick={() => { if (!selectedMembers.find(m => m.id === u.id)) setSelectedMembers(prev => [...prev, u]); setGroupSearch(""); setGroupSearchResults([]); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-zinc-400" /> {u.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((m) => (
                  <span key={m.id} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                    {m.name}
                    <button onClick={() => setSelectedMembers(prev => prev.filter(x => x.id !== m.id))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <button onClick={handleCreateGroup} disabled={isCreatingGroup || !newGroupName || selectedMembers.length === 0}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              {isCreatingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Buat Grup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
