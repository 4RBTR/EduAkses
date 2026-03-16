"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { cn } from "@/lib/utils";

interface NavbarProps {
  session: any;
}

export function Navbar({ session }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled || isOpen 
        ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50 py-2" 
        : "bg-transparent py-4"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-linear-to-br from-primary to-indigo-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 dark:shadow-primary/40">
            E
          </div>
          <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-white dark:via-zinc-200 dark:to-white">
            EduAkses
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-10">
          <Link href="#features" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all">Fitur</Link>
          <Link href="#about" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-all">Tentang</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {session ? (
              <Link 
                href="/dashboard"
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                Ke Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-black text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors pr-2">Masuk</Link>
                <Link 
                  href="/register"
                  className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-black shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "md:hidden absolute top-full left-0 w-full bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="p-6 flex flex-col gap-6">
          <Link href="#features" onClick={() => setIsOpen(false)} className="text-lg font-bold">Fitur</Link>
          <Link href="#about" onClick={() => setIsOpen(false)} className="text-lg font-bold">Tentang</Link>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center justify-between">
            <span className="font-bold">Tema</span>
            <ThemeToggle />
          </div>
          {session ? (
            <Link 
              href="/dashboard"
              className="bg-primary text-white py-4 rounded-2xl text-center font-black shadow-xl"
            >
              Ke Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link 
                href="/login"
                className="w-full py-4 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl text-center font-black"
              >
                Masuk
              </Link>
              <Link 
                href="/register"
                className="w-full py-4 bg-primary text-white rounded-2xl text-center font-black shadow-xl"
              >
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
