"use client";

import { useEffect, useState } from "react";
import { getClassLeaderboard, type LeaderboardEntry } from "@/app/dashboard/_actions/leaderboard";
import { Trophy, Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardWidgetProps {
  classId: string;
}

const MEDAL = {
  1: { label: "🥇", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700/40", ring: "ring-yellow-400" },
  2: { label: "🥈", color: "text-zinc-400", bg: "bg-zinc-50 dark:bg-zinc-900/20", border: "border-zinc-200 dark:border-zinc-700/40", ring: "ring-zinc-300" },
  3: { label: "🥉", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20", border: "border-amber-200 dark:border-amber-700/40", ring: "ring-amber-400" },
} as const;

export function LeaderboardWidget({ classId }: LeaderboardWidgetProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClassLeaderboard(classId).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [classId]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="h-4 w-32 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-2 animate-pulse" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-center">
        <Trophy className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Belum ada data leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-500" />
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Leaderboard XP</h3>
        <span className="ml-auto text-[10px] text-zinc-400 font-medium">Kelas ini</span>
      </div>

      {/* Top 3 Podium */}
      <div className="flex items-end justify-center gap-3 px-5 pt-5 pb-3">
        {/* 2nd place */}
        {top3[1] && (
          <PodiumCard entry={top3[1]} rank={2} />
        )}
        {/* 1st place - taller */}
        {top3[0] && (
          <PodiumCard entry={top3[0]} rank={1} tall />
        )}
        {/* 3rd place */}
        {top3[2] && (
          <PodiumCard entry={top3[2]} rank={3} />
        )}
      </div>

      {/* Rest of the list */}
      {rest.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-50 dark:divide-zinc-800/60">
          {rest.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                "flex items-center gap-3 px-5 py-2.5 transition-colors",
                entry.isCurrentUser && "bg-primary/5"
              )}
            >
              <span className="text-xs font-bold text-zinc-400 w-5 text-center">{entry.rank}</span>
              <Avatar name={entry.name} avatar={entry.avatar} size="sm" isCurrentUser={entry.isCurrentUser} />
              <p className={cn(
                "flex-1 text-xs font-semibold truncate",
                entry.isCurrentUser ? "text-primary" : "text-zinc-700 dark:text-zinc-300"
              )}>
                {entry.name}
                {entry.isCurrentUser && <span className="ml-1 text-[10px] text-primary/70">(Kamu)</span>}
              </p>
              <div className="flex items-center gap-1">
                <Medal className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{entry.points.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function Avatar({ name, avatar, size = "md", isCurrentUser }: {
  name: string; avatar: string | null; size?: "sm" | "md";
  isCurrentUser?: boolean;
}) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const base = size === "sm" ? "w-7 h-7 text-[10px]" : "w-10 h-10 text-sm";
  return (
    <div className={cn(
      base, "rounded-full flex items-center justify-center font-bold shrink-0",
      isCurrentUser
        ? "bg-primary/20 text-primary ring-2 ring-primary/40"
        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
    )}>
      {avatar
        ? <img src={avatar} alt={name} className={cn("rounded-full object-cover w-full h-full")} />
        : initials
      }
    </div>
  );
}

function PodiumCard({ entry, rank, tall }: { entry: LeaderboardEntry; rank: 1 | 2 | 3; tall?: boolean }) {
  const medal = MEDAL[rank];
  return (
    <div className={cn("flex flex-col items-center gap-1.5 flex-1 max-w-[90px]", tall ? "pb-1" : "pb-0 mt-4")}>
      <span className="text-2xl leading-none">{medal.label}</span>
      <div className={cn(
        "w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ring-2",
        medal.ring,
        entry.isCurrentUser
          ? "bg-primary/20 text-primary"
          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
      )}>
        {entry.avatar
          ? <img src={entry.avatar} alt={entry.name} className="rounded-full object-cover w-full h-full" />
          : entry.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        }
      </div>
      <p className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 text-center truncate w-full px-1">
        {entry.name.split(" ")[0]}
      </p>
      <div className={cn(
        "w-full rounded-xl py-1 text-center border text-[10px] font-bold",
        medal.bg, medal.border, medal.color
      )}>
        {entry.points.toLocaleString()} XP
      </div>
      {/* Rank podium base */}
      <div className={cn(
        "w-full rounded-t-sm",
        rank === 1 ? "h-8 bg-yellow-400 dark:bg-yellow-600" :
        rank === 2 ? "h-5 bg-zinc-300 dark:bg-zinc-600" :
        "h-3 bg-amber-500 dark:bg-amber-700"
      )} />
    </div>
  );
}
