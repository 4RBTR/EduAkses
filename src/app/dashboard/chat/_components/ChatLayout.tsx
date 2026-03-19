"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { getDMs, sendDM } from "../_actions/dm";
import { getGroupMessages, sendGroupMessage, createGroup, searchUsersForGroup } from "../_actions/groups";
import { getChannelMessages, sendChannelMessage } from "../_actions/channels";
import {
  Send, Loader2, User as UserIcon, Users, Search, MessageSquare,
  CheckCheck, Check, FileText, Plus, X, Hash, ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────

type Contact = {
  id: string; name: string; email: string; role: string; avatar?: string | null;
};
type Group = {
  id: string; name: string; creatorId: string;
  members: Array<{ id: string; userId: string; user: { id: string; name: string; avatar?: string | null } }>;
  messages: Array<{ id: string; createdAt: Date; sender: { name: string } } & { content: string | null }>;
};
type Channel = {
  id: string; name: string; description?: string | null; classId: string;
};
type BaseMsg = {
  id: string; content?: string | null; attachmentUrl?: string | null; attachmentType?: string | null;
  createdAt: Date; sender: { id: string; name: string; avatar?: string | null };
  isRead?: boolean;
};

interface ChatLayoutProps {
  currentUserId: string;
  currentUserName: string;
  contacts: Contact[];
  groups: Group[];
}

// ── Main Layout ────────────────────────────────────────────────────────

export function ChatLayout({ currentUserId, currentUserName, contacts, groups: groupsInit }: ChatLayoutProps) {
  // Navigation state
  const [search, setSearch] = useState("");

  // DM state
  const [activeContact, setActiveContact] = useState<Contact | null>(null);

  // Group state
  const [groups, setGroups] = useState<Group[]>(groupsInit);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupSearchResults, setGroupSearchResults] = useState<Contact[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Contact[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Channel state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);
  const [groupsExpanded, setGroupsExpanded] = useState(true);

  // Messages state
  const [messages, setMessages] = useState<BaseMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Stabilize props for handlers
  const identityRef = useRef({ currentUserId, currentUserName, contacts });
  useEffect(() => {
    identityRef.current = { currentUserId, currentUserName, contacts };
  }, [currentUserId, currentUserName, contacts]);

  // Auto scroll
  useEffect(() => { 
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Load channels initial
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const resp = await fetch("/api/channels");
        if (resp.ok) {
          const data = await resp.json();
          setChannels(data);
          if (data.length > 0 && !activeChannel) {
            setActiveChannel(data[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load channels", err);
      }
    };
    loadInitialData();
  }, []);

  // Load DM messages + subscribe Realtime
  useEffect(() => {
    if (!activeContact) return;
    const contactId = activeContact.id;
    getDMs(contactId).then((msgs) => setMessages(msgs as BaseMsg[]));

    const channel = supabase
      .channel(`dm-${contactId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        (payload) => {
          const newMsg = payload.new as any;
          const { currentUserId: uid, currentUserName: uname, contacts: cList } = identityRef.current;
          
          const isRelevant = (newMsg.senderId === uid && newMsg.receiverId === contactId) ||
                             (newMsg.senderId === contactId && newMsg.receiverId === uid);
          if (!isRelevant) return;

          const senderContact = cList.find((c) => c.id === newMsg.senderId);
          const senderName = newMsg.senderId === uid ? uname : (senderContact?.name || "Unknown");

          const formatted: BaseMsg = {
            id: newMsg.id,
            content: newMsg.content,
            attachmentUrl: newMsg.attachmentUrl,
            attachmentType: newMsg.attachmentType,
            createdAt: new Date(newMsg.createdAt),
            sender: { id: newMsg.senderId, name: senderName, avatar: null },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === formatted.id)) return prev;
            return [...prev, formatted];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeContact?.id]);

  // Load group messages + subscribe Realtime
  useEffect(() => {
    if (!activeGroup) return;
    const groupId = activeGroup.id;
    getGroupMessages(groupId).then((msgs) => setMessages(msgs as BaseMsg[]));

    const channel = supabase
      .channel(`group-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `groupId=eq.${groupId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          const { currentUserId: uid, currentUserName: uname, contacts: cList } = identityRef.current;
          
          const senderContact = cList.find((c) => c.id === newMsg.senderId);
          const senderName = newMsg.senderId === uid ? uname : (senderContact?.name || "Unknown");

          const formatted: BaseMsg = {
            id: newMsg.id,
            content: newMsg.content,
            attachmentUrl: newMsg.attachmentUrl,
            attachmentType: newMsg.attachmentType,
            createdAt: new Date(newMsg.createdAt),
            sender: { id: newMsg.senderId, name: senderName, avatar: null },
          };

          setMessages((prev) => {
            if (prev.some((m) => m.id === formatted.id)) return prev;
            return [...prev, formatted];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeGroup?.id]);

  // Load channel messages + subscribe Realtime
  useEffect(() => {
    if (!activeChannel) return;
    const channelId = activeChannel.id;
    getChannelMessages(channelId).then((msgs) => setMessages(msgs as BaseMsg[]));

    const channel = supabase
      .channel(`channel-${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `channelId=eq.${channelId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          const { currentUserId: uid, currentUserName: uname, contacts: cList } = identityRef.current;
          
          const senderContact = cList.find((c) => c.id === newMsg.senderId);
          const senderName = newMsg.senderId === uid ? uname : (senderContact?.name || "Unknown");

          const formatted: BaseMsg = {
            id: newMsg.id,
            content: newMsg.content,
            attachmentUrl: newMsg.attachmentUrl,
            attachmentType: newMsg.attachmentType,
            createdAt: new Date(newMsg.createdAt),
            sender: { id: newMsg.senderId, name: senderName, avatar: null },
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === formatted.id)) return prev;
            return [...prev, formatted];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChannel?.id]);

  // Group search
  useEffect(() => {
    if (groupSearch.length < 2) { setGroupSearchResults([]); return; }
    const timer = setTimeout(() => {
      searchUsersForGroup(groupSearch).then((r) => setGroupSearchResults(r));
    }, 300);
    return () => clearTimeout(timer);
  }, [groupSearch]);

  // ── Send message ──
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;
    setIsSending(true);
    const text = inputText.trim();
    setInputText("");

    try {
      if (activeContact) {
        const msg = await sendDM(activeContact.id, text) as BaseMsg;
        setMessages((prev) => [...prev, msg]);
      } else if (activeGroup) {
        await sendGroupMessage(activeGroup.id, text);
      } else if (activeChannel) {
        await sendChannelMessage(activeChannel.id, text);
      }
    } catch {
      toast.error("Gagal mengirim pesan");
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  // ── Create group ──
  const handleCreateGroup = async () => {
    if (!newGroupName || selectedMembers.length === 0) return;
    setIsCreatingGroup(true);
    try {
      await createGroup(newGroupName, selectedMembers.map((m) => m.id));
      setShowCreateGroup(false);
      setNewGroupName("");
      setSelectedMembers([]);
      toast.success("Grup berhasil dibuat!");
      window.location.reload();
    } catch {
      toast.error("Gagal membuat grup");
    } finally { setIsCreatingGroup(false); }
  };

  // ── Filtered lists ──
  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ── Active chat label ──
  const activeName = activeContact?.name || activeGroup?.name || (activeChannel ? `#${activeChannel.name}` : null);
  const activeSubtitle = activeContact
    ? activeContact.email
    : activeGroup
    ? `${activeGroup.members.length} anggota`
    : activeChannel?.description || "Channel kelas";

  // ── UI RENDER HELPERS ──
  const renderMessage = (msg: BaseMsg) => {
    const isMe = msg.sender.id === currentUserId;
    return (
      <div key={msg.id} className={cn(
        "group flex w-full gap-3 px-4 py-1.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors",
        isMe ? "bg-primary/5 dark:bg-primary/5" : ""
      )}>
        <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 border border-zinc-200 dark:border-zinc-700 mt-1">
          {msg.sender.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn(
              "text-sm font-bold truncate",
              isMe ? "text-primary" : "text-zinc-900 dark:text-zinc-100"
            )}>
              {msg.sender.name}
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isMe && (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                {msg.isRead ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} className="text-zinc-400" />}
              </span>
            )}
          </div>

          <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed overflow-wrap-anywhere">
            {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
            
            {msg.attachmentUrl && (
              <div className="mt-2 max-w-sm">
                {msg.attachmentType === "image" ? (
                  <img 
                    src={msg.attachmentUrl} 
                    alt="attachment" 
                    className="rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm cursor-zoom-in active:scale-95 transition-transform" 
                    onClick={() => window.open(msg.attachmentUrl!, "_blank")} 
                  />
                ) : (
                  <a href={msg.attachmentUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-primary/50 transition-colors w-fit">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FileText size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Lampiran Dokumen</p>
                      <p className="text-[10px] text-zinc-500">Klik untuk melihat file</p>
                    </div>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* ── Discord-style Left Sidebar ────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
        
        {/* Search Header */}
        <div className="p-4 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pencarian cepat..."
              className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 flex-1 outline-none placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Scrollable Nav Sections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Channels */}
          <div className="py-4">
            <button
              className="w-full flex items-center justify-between px-4 py-1.5 text-[11px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
              onClick={() => setChannelsExpanded((v) => !v)}
            >
              <span className="flex items-center gap-1.5"><Hash size={12} /> Channels Kelas</span>
              <ChevronDown size={12} className={cn("transition-transform duration-200", !channelsExpanded && "-rotate-90")} />
            </button>
            {channelsExpanded && (
              <div className="mt-1 px-2 space-y-0.5">
                {filteredChannels.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 px-4 py-2 italic text-center">No channels found</p>
                ) : (
                  filteredChannels.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => { setActiveChannel(ch); setActiveContact(null); setActiveGroup(null); setMessages([]); }}
                      className={cn(
                        "w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all relative group",
                        activeChannel?.id === ch.id
                          ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                      )}
                    >
                      <Hash size={16} className={cn(activeChannel?.id === ch.id ? "text-white" : "text-zinc-400 group-hover:text-primary")} />
                      <span className="truncate">{ch.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 mx-4" />

          {/* DMs */}
          <div className="py-4">
            <button
              className="w-full flex items-center justify-between px-4 py-1.5 text-[11px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
              onClick={() => setDmsExpanded((v) => !v)}
            >
              <span className="flex items-center gap-1.5"><MessageSquare size={12} /> Direct Messages</span>
              <ChevronDown size={12} className={cn("transition-transform duration-200", !dmsExpanded && "-rotate-90")} />
            </button>
            {dmsExpanded && (
              <div className="mt-1 px-2 space-y-0.5">
                {filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setActiveContact(c); setActiveChannel(null); setActiveGroup(null); setMessages([]); }}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      activeContact?.id === c.id
                        ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                      activeContact?.id === c.id ? "bg-white text-primary" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                    )}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate flex-1">{c.name}</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-px bg-zinc-200 dark:bg-zinc-800 mx-4" />

          {/* Groups */}
          <div className="py-4 pb-20">
            <button
              className="w-full flex items-center justify-between px-4 py-1.5 text-[11px] font-black tracking-widest uppercase text-zinc-400 dark:text-zinc-500 hover:text-primary transition-colors"
              onClick={() => setGroupsExpanded((v) => !v)}
            >
              <span className="flex items-center gap-1.5"><Users size={12} /> Grup Chat</span>
              <div className="flex items-center gap-2">
                <Plus size={14} className="hover:text-primary cursor-pointer active:scale-90" onClick={(e) => { e.stopPropagation(); setShowCreateGroup(true); }} />
                <ChevronDown size={12} className={cn("transition-transform duration-200", !groupsExpanded && "-rotate-90")} />
              </div>
            </button>
            {groupsExpanded && (
              <div className="mt-1 px-2 space-y-0.5">
                {filteredGroups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => { setActiveGroup(g); setActiveChannel(null); setActiveContact(null); setMessages([]); }}
                    className={cn(
                      "w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                      activeGroup?.id === g.id
                        ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                      activeGroup?.id === g.id ? "bg-white/20 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                    )}>
                      <Users size={14} />
                    </div>
                    <span className="truncate">{g.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current User Tooltip (Bottom Sidebar) */}
        <div className="p-4 bg-zinc-200/30 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-black text-white shadow-sm ring-2 ring-white dark:ring-zinc-800">
              {currentUserName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{currentUserName}</p>
              <p className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">Status: Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900 h-full overflow-hidden relative">
        {activeName ? (
          <>
            {/* Header: Fixed */}
            <div className="h-16 shrink-0 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-sm">
                  {activeChannel ? <Hash size={18} /> : activeGroup ? <Users size={18} /> : <UserIcon size={18} />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 truncate">
                    {activeName}
                    {!activeContact && <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[9px] font-black text-zinc-500 uppercase">Public</span>}
                  </h3>
                  <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-medium">{activeSubtitle}</p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-3 ml-4">
                {activeGroup && (
                  <div className="hidden sm:flex -space-x-2 mr-4">
                    {activeGroup.members.slice(0, 5).map((m) => (
                      <div key={m.id} className="w-7 h-7 rounded-full bg-white dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                        {m.user.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {activeGroup.members.length > 5 && (
                      <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-700 flex items-center justify-center text-[9px] font-black text-zinc-500">
                        +{activeGroup.members.length - 5}
                      </div>
                    )}
                  </div>
                )}
                <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors focus:outline-none">
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area: Independent Scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-2 px-1">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-20 px-8 text-center animate-in zoom-in duration-300">
                  <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6 ring-8 ring-primary/5">
                    {activeChannel ? <Hash size={40} className="text-zinc-300" /> : <MessageSquare size={40} className="text-zinc-300" />}
                  </div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Selamat datang di {activeName}!</h4>
                  <p className="text-sm text-zinc-500 mt-2 max-w-sm">Ini adalah awal perjalanan dari percakapan yang mengagumkan. Say hi!</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {messages.map(renderMessage)}
                  <div ref={endRef} className="h-4" />
                </div>
              )}
            </div>

            {/* Input Bar: Fixed at Bottom */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
              <form onSubmit={handleSend} className="flex items-end gap-3 max-w-6xl mx-auto">
                <button
                  type="button"
                  onClick={() => toast.info("Gunakan URL eksternal (Google Drive/OneDrive) untuk melampirkan file besar.")}
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-primary/5 dark:hover:bg-zinc-800 transition-all shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm focus:outline-none"
                >
                  <Plus className="w-5 h-5" />
                </button>

                <div className="flex-1 bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 rounded-2xl flex flex-col focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary/50 transition-all shadow-inner px-4 overflow-hidden min-h-[44px]">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={`Kirim pesan ke ${activeName}...`}
                    className="w-full bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border-0 focus:outline-none resize-none py-3 max-h-32 min-h-[44px] overflow-y-auto custom-scrollbar"
                    rows={1}
                    disabled={isSending}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition-all shrink-0 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 focus:outline-none"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </button>
              </form>
              <div className="max-w-6xl mx-auto mt-2 flex justify-end">
                 <p className="text-[10px] text-zinc-400 font-medium italic">Tekan <strong>Enter</strong> untuk mengirim</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 animate-in fade-in duration-700">
            <div className="w-24 h-24 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center mb-6 ring-1 ring-zinc-200 dark:ring-zinc-700 shadow-lg">
              <MessageSquare className="w-12 h-12 text-primary/30" />
            </div>
            <h3 className="font-extrabold text-zinc-800 dark:text-zinc-200 text-2xl tracking-tight">Pilih Obrolan</h3>
            <p className="text-sm text-center mt-3 max-w-xs text-zinc-500 font-medium leading-relaxed">
              Selamat datang di pusat komunikasi EduAkses. Hubungi guru atau teman kelas kamu sekarang.
            </p>
            <div className="mt-8 flex gap-3">
              <div className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest">Select a channel</div>
              <div className="px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest">Start a DM</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Group Modal ─────────────────────────────────────── */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 w-full max-w-md shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-zinc-900 dark:text-zinc-100 text-2xl tracking-tighter">Grup Baru</h3>
                <p className="text-xs text-zinc-500 mt-1">Bentuk komunitas kolaborasi baru kamu.</p>
              </div>
              <button onClick={() => setShowCreateGroup(false)} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors focus:outline-none">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Nama Grup</label>
                <input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Misal: Diskusi Proyek Capstone"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Cari Anggota</label>
                <div className="relative">
                  <input
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Ketik nama atau email..."
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                  />
                  {groupSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-2 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden bg-white dark:bg-zinc-950 shadow-2xl z-20">
                      {groupSearchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => { if (!selectedMembers.find((m) => m.id === u.id)) setSelectedMembers((prev) => [...prev, u]); setGroupSearch(""); setGroupSearchResults([]); }}
                          className="w-full text-left px-5 py-3 text-sm text-zinc-900 dark:text-zinc-100 hover:bg-primary/5 dark:hover:bg-primary/10 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 last:border-0"
                        >
                          <span className="font-bold">{u.name}</span>
                          <span className="text-[10px] text-zinc-400">{u.email}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedMembers.map((m) => (
                  <span key={m.id} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-[11px] font-black rounded-xl border border-primary/20 group">
                    {m.name}
                    <button onClick={() => setSelectedMembers((prev) => prev.filter((x) => x.id !== m.id))} className="hover:text-red-500 transition-colors focus:outline-none">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={handleCreateGroup}
              disabled={isCreatingGroup || !newGroupName || selectedMembers.length === 0}
              className="w-full py-4 bg-primary text-white font-black rounded-2xl hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 text-sm focus:outline-none"
            >
              {isCreatingGroup ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              AKTIFKAN GRUP
            </button>
          </div>
        </div>
      )}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #e4e4e7; 
          border-radius: 20px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}
