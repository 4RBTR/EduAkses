"use client";

import { useState } from "react";
import { Copy, Check, Hash } from "lucide-react";

export function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="px-3 flex items-center gap-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
        <Hash className="w-3.5 h-3.5 text-primary" />
        {code}
      </div>
      <button
        onClick={handleCopy}
        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-primary border border-zinc-200 dark:border-zinc-700 transition-all active:scale-90"
        title="Salin Kode"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
