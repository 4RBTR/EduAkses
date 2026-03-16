"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-9 h-9" />; // Placeholder to avoid layout shift
  }

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const getIcon = () => {
    if (theme === "light") return <Sun size={18} className="text-amber-500" />;
    if (theme === "dark") return <Moon size={18} className="text-indigo-400" />;
    return <Monitor size={18} className="text-zinc-500" />;
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center border border-zinc-200 dark:border-zinc-800"
      title={`Current theme: ${theme}. Click to switch.`}
    >
      {getIcon()}
    </button>
  );
}
