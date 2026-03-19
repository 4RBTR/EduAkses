"use client";

import React, { useRef, useEffect, useState, MouseEvent } from "react";
import { useCanvas } from "./CanvasContext";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, MousePointer2 } from "lucide-react";

export default function InfiniteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { lines, setLines, cursors, myColor, broadcastLine, broadcastCursor, clearBoard } = useCanvas();
  const [isDrawing, setIsDrawing] = useState(false);
  
  // To optimize standard drawing locally before broadcasting
  const currentLineRef = useRef<{ points: {x: number, y: number}[], color: string, width: number } | null>(null);

  // Handle drawing resize
  useEffect(() => {
    const resize = () => {
      if (canvasRef.current) {
        // Set actual internal canvas resolution to match display size
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
      redrawAll();
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Redraw when lines change from broadcast
  useEffect(() => {
    redrawAll();
  }, [lines]);

  const redrawAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all confirmed lines
    lines.forEach(line => {
      drawLine(ctx, line);
    });

    // Draw current line being drawn
    if (currentLineRef.current) {
      drawLine(ctx, currentLineRef.current);
    }
  };

  const drawLine = (ctx: CanvasRenderingContext2D, line: any) => {
    if (!line.points || line.points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(line.points[0].x, line.points[0].y);
    for (let i = 1; i < line.points.length; i++) {
       ctx.lineTo(line.points[i].x, line.points[i].y);
    }
    ctx.strokeStyle = line.color || "#000";
    ctx.lineWidth = line.width || 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    currentLineRef.current = {
      points: [{ x, y }],
      color: myColor,
      width: 4
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Throttle cursor broadcast
    if (Math.random() > 0.3) {
      // we use user ID as unique presence key, assumed managed by context.
      broadcastCursor(x, y); 
    }

    if (!isDrawing || !currentLineRef.current) return;

    currentLineRef.current.points.push({ x, y });
    redrawAll();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (currentLineRef.current && currentLineRef.current.points.length > 1) {
      const newLine = { ...currentLineRef.current };
      broadcastLine(newLine);
    }
    currentLineRef.current = null;
    redrawAll();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-950">
      {/* Background Reveal Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff0a 1px, transparent 1px), linear-gradient(to bottom, #ffffff0a 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="absolute inset-0 touch-none cursor-crosshair"
      />

      {/* Floating Toolbar with Glassmorphism */}
      <motion.div 
         initial={{ y: 50, opacity: 0 }}
         animate={{ y: 0, opacity: 1 }}
         transition={{ delay: 0.5, type: 'spring' }}
         className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/10 dark:bg-black/30 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl"
      >
        <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white">
           <MousePointer2 className="w-5 h-5" />
        </button>
        <div className="w-px h-8 bg-white/20"></div>
        <div className="flex gap-2 items-center px-2">
           <div className="w-6 h-6 rounded-full border-2 border-white/50" style={{ backgroundColor: myColor }}></div>
           <span className="text-xs text-white/70 font-medium">Your Color</span>
        </div>
        <div className="w-px h-8 bg-white/20"></div>
        <button 
          onClick={clearBoard}
          className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded-xl transition-colors"
          title="Clear Board"
        >
           <Trash2 className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Collaborative Cursors presence */}
      <AnimatePresence>
        {Object.entries(cursors).map(([key, cursor]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, x: cursor.x, y: cursor.y }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.5 }}
            className="absolute top-0 left-0 pointer-events-none z-50 flex items-center gap-2"
          >
            <MousePointer2 
               className="w-5 h-5 -mt-1 -ml-1 drop-shadow-lg" 
               style={{ color: cursor.color, fill: cursor.color }} 
            />
            <div 
               className="px-2 py-1 rounded-md text-[10px] text-white font-bold whitespace-nowrap"
               style={{ backgroundColor: cursor.color, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
            >
              {cursor.name || "Peer"}
            </div>
            {/* Neon Trail Effect - Simulated with drop shadow */}
            <motion.div 
               className="absolute top-0 left-0 w-4 h-4 rounded-full blur-md opacity-50"
               style={{ backgroundColor: cursor.color }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
