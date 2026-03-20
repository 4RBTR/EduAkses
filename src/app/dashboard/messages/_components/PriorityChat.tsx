"use client";

import { useEffect, useState, useRef } from "react";
import { getPriorityContacts, getPriorityMessages, sendPriorityMessage } from "../_actions/priority-messages";
import { Send, User as UserIcon, Loader2, Paperclip, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface Contact {
  id: string;
  name: string;
  email: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
}

export function PriorityChat({ currentUserId }: { currentUserId: string }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPriorityContacts()
      .then(setContacts)
      .finally(() => setLoadingContacts(false));
  }, []);

  useEffect(() => {
    if (activeContact) {
      getPriorityMessages(activeContact.id).then(setMessages);
    }
  }, [activeContact]);

  // ── Supabase Realtime: instant priority message push ──
  useEffect(() => {
    if (!activeContact) return;
    const contactId = activeContact.id;

    const channel = supabase
      .channel(`priority-dm-${currentUserId}-${contactId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "priority_messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if relevant to this conversation
          const isRelevant =
            (newMsg.senderId === currentUserId && newMsg.receiverId === contactId) ||
            (newMsg.senderId === contactId && newMsg.receiverId === currentUserId);
          if (!isRelevant) return;

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            const createdStr = newMsg.createdAt as unknown as string;
            const dateObj = new Date(createdStr.endsWith('Z') || createdStr.includes('+') ? createdStr : createdStr + 'Z');
            return [...prev, { ...newMsg, createdAt: dateObj }];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeContact?.id, currentUserId]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContact || isSending) return;

    setIsSending(true);
    try {
      const newMsg = await sendPriorityMessage(activeContact.id, inputText.trim());
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      setInputText("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-full flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800">
      
      {/* Contacts Sidebar */}
      <div className="w-full md:w-80 shrink-0 flex flex-col bg-zinc-50 dark:bg-zinc-950/50">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h2 className="font-bold text-sm text-zinc-500 uppercase tracking-widest">Contacts</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingContacts ? (
             <div className="flex justify-center p-8"><Loader2 className="w-5 h-5 animate-spin text-zinc-400" /></div>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center p-4">Tidak ada kontak yang tersedia.</p>
          ) : (
            contacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => setActiveContact(contact)}
                className={cn(
                  "w-full text-left flex items-center gap-3 p-3 rounded-xl transition-all",
                  activeContact?.id === contact.id
                    ? "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20"
                    : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 border-transparent"
                )}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm truncate text-zinc-900 dark:text-zinc-100">{contact.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{contact.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 relative">
        {activeContact ? (
          <>
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur sticky top-0 z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{activeContact.name}</h3>
                <p className="text-xs text-zinc-500">{activeContact.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {messages.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-sm h-full">
                   <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                     <UserIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                   </div>
                   Mulai percakapan dengan {activeContact.name}
                 </div>
               ) : (
                 messages.map(msg => {
                   const isMe = msg.senderId === currentUserId;
                   return (
                     <div key={msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                       <div className={cn(
                         "max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 text-sm flex flex-col shadow-sm",
                         isMe 
                          ? "bg-indigo-600 text-white rounded-br-sm" 
                          : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                       )}>
                         <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.content}</p>
                         <div className={cn("flex items-center justify-end gap-1 mt-2", isMe ? "text-indigo-200" : "text-zinc-400 dark:text-zinc-500")}>
                           <span className="text-[10px] font-medium tracking-wide">
                             {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {isMe && <CheckCheck className="w-3.5 h-3.5" />}
                         </div>
                       </div>
                     </div>
                   )
                 })
               )}
               <div ref={endOfMessagesRef} />
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 sticky bottom-0 z-10">
               <form onSubmit={handleSend} className="flex items-end gap-2">
                 <button 
                  type="button"
                  className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                  title="Lampirkan File (Segera Hadir)"
                 >
                   <Paperclip className="w-5 h-5" />
                 </button>
                 <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl min-h-[48px] flex items-center px-4 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-shadow">
                   <textarea 
                     value={inputText}
                     onChange={e => setInputText(e.target.value)}
                     onKeyDown={e => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         handleSend(e as any);
                       }
                     }}
                     placeholder="Tulis pesan..."
                     className="w-full bg-transparent border-0 text-sm focus:outline-none focus:ring-0 resize-none py-3 h-12 overflow-hidden"
                     rows={1}
                     disabled={isSending}
                   />
                 </div>
                 <button 
                  type="submit"
                  disabled={isSending || !inputText.trim()}
                  className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-colors shrink-0 shadow-sm"
                 >
                   {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                 </button>
               </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8 text-center h-full">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <UserIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="font-medium text-zinc-600 dark:text-zinc-300">Pilih kontak</p>
            <p className="text-sm mt-1 max-w-[250px]">Pilih kontak dari daftar di samping untuk memulai percakapan prioritas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
