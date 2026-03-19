"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react"; // Check usage of next-auth sessions in context

// Initialize outside to prevent remounts if needed, or inside context.
// Assuming NEXT_PUBLIC_SUPABASE_URL is available
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface CursorInfo {
  x: number;
  y: number;
  name: string;
  color: string;
  userId: string;
}

interface CanvasContextType {
  lines: any[];
  setLines: React.Dispatch<React.SetStateAction<any[]>>;
  cursors: Record<string, CursorInfo>;
  myColor: string;
  broadcastLine: (line: any) => void;
  broadcastCursor: (x: number, y: number) => void;
  clearBoard: () => void;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

const COLORS = ["#ff1b6b", "#45caff", "#00ff87", "#60efff", "#ff0099", "#f9d423"];

export function CanvasProvider({ children, groupId, initialLines }: { children: React.ReactNode, groupId: string, initialLines: any[] }) {
  const [lines, setLines] = useState<any[]>(initialLines);
  const [cursors, setCursors] = useState<Record<string, CursorInfo>>({});
  const channelRef = useRef<any>(null);
  
  // Basic mock auth lookup for name/id, in real app pass user info as prop
  // We'll require user info from the host component to set presence correctly.
  
  // Generate color deterministically for SSR to prevent hydration errors
  const [myColor, setMyColor] = useState<string>(COLORS[0]);

  useEffect(() => {
    setMyColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }, []);

  // Let's assume we pass down user details via a prop or context.
  // The actual implementation needs user details. For now we use generic.

  const broadcastLine = (line: any) => {
    setLines(prev => [...prev, line]);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'draw',
        payload: { line }
      });
    }
  };

  const broadcastCursor = (x: number, y: number, name: string = "User", userId: string = "1") => {
    if (channelRef.current) {
      channelRef.current.track({ cursor: { x, y }, name, color: myColor, userId });
    }
  };

  const clearBoard = () => {
    setLines([]);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'clear_board',
        payload: {}
      });
    }
  };

  useEffect(() => {
    const channel = supabase.channel(`board:${groupId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: 'user' },
      },
    });

    channel
      .on('broadcast', { event: 'draw' }, ({ payload }) => {
        setLines((prev) => [...prev, payload.line]);
      })
      .on('broadcast', { event: 'clear_board' }, () => {
        setLines([]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const activeCursors: Record<string, CursorInfo> = {};
        for (const [key, presences] of Object.entries(state)) {
           // presences is an array of presence objects for that key
           const latestPresence = presences[presences.length - 1] as any;
           if (latestPresence.cursor) {
              activeCursors[key] = {
                ...latestPresence.cursor,
                name: latestPresence.name,
                color: latestPresence.color,
                userId: latestPresence.userId
              };
           }
        }
        setCursors(activeCursors);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
           // Successfully joined
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  // Periodic saver (debounce) to persist state to API
  useEffect(() => {
    const saveState = setTimeout(() => {
      fetch(`/api/groups/${groupId}/board`, {
        method: "POST",
        body: JSON.stringify({ state: { lines } })
      }).catch(console.error);
    }, 5000); // save every 5 seconds if changed

    return () => clearTimeout(saveState);
  }, [lines, groupId]);

  return (
    <CanvasContext.Provider value={{
      lines,
      setLines,
      cursors,
      myColor,
      broadcastLine,
      broadcastCursor,
      clearBoard
    }}>
      {children}
    </CanvasContext.Provider>
  );
}

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error("useCanvas must be used within CanvasProvider");
  return ctx;
};
