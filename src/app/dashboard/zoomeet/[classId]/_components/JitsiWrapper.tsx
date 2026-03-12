"use client";

import { Maximize, Minimize } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface JitsiWrapperProps {
  roomName: string;
  userName: string;
}

export function JitsiWrapper({ roomName, userName }: JitsiWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Listen for fullscreen change events so the UI button updates if user presses "Esc"
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Error attempting to toggle full-screen mode:", err);
    }
  };

  // Embed URL for Jitsi. Using parameters to set display name auto and some UI settings.
  // config.prejoinPageEnabled=false bypasses the "enter your name" page.
  const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(roomName)}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(userName)}"`;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Live Video Conference</h2>
          <p className="text-sm text-zinc-500">Ruangan: {roomName.replace("EduAkses_Class_", "")}</p>
        </div>
        
        <button
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          title={isFullscreen ? "Keluar dari layar penuh" : "Masuk ke Mode Fokus"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          <span>{isFullscreen ? "Exit Focus Mode" : "Focus Mode"}</span>
        </button>
      </div>

      <div 
        ref={containerRef} 
        className={cn(
          "relative flex-1 rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800 bg-black",
          isFullscreen && "rounded-none border-none"
        )}
      >
        <iframe
          src={jitsiUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="absolute inset-0 w-full h-full border-none"
          title="Jitsi Meet Conference"
        />
        
        {/* Overlay button visible ONLY when in fullscreen so users can easily exit */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm transition-colors"
            title="Keluar dari layar penuh"
          >
            <Minimize className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
