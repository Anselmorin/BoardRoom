"use client";

import { Note, RepeatRule } from "@/lib/types";

export function getRepeatLabel(rule: RepeatRule): string {
  const labels: Record<RepeatRule, string> = {
    none: "",
    hourly: "Every hour",
    every2h: "Every 2h",
    every4h: "Every 4h",
    every6h: "Every 6h",
    every8h: "Every 8h",
    every12h: "Every 12h",
    daily: "Daily",
    weekly: "Weekly",
  };
  return labels[rule] || "";
}

export function getRepeatMs(rule: RepeatRule): number {
  const ms: Record<RepeatRule, number> = {
    none: 0,
    hourly: 3600000,
    every2h: 7200000,
    every4h: 14400000,
    every6h: 21600000,
    every8h: 28800000,
    every12h: 43200000,
    daily: 86400000,
    weekly: 604800000,
  };
  return ms[rule] || 0;
}

export function isReminderDue(note: Note): boolean {
  if (note.type !== "reminder") return false;
  if (note.completedAt) return false;

  if (note.dueAt) {
    return Date.now() >= new Date(note.dueAt).getTime();
  }

  if (note.repeatRule && note.repeatRule !== "none") {
    const intervalMs = getRepeatMs(note.repeatRule);
    const lastCheck = note.lastTriggered
      ? new Date(note.lastTriggered).getTime()
      : new Date(note.createdAt).getTime();
    return Date.now() >= lastCheck + intervalMs;
  }

  return false;
}

export function getTimeUntilDue(note: Note): string | null {
  if (!note.dueAt) return null;
  const diff = new Date(note.dueAt).getTime() - Date.now();
  if (diff <= 0) return "⚠️ Due now";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h === 0) return `in ${m}m`;
  return `in ${h}h ${m}m`;
}

interface ReminderBadgeProps {
  note: Note;
}

export default function ReminderBadge({ note }: ReminderBadgeProps) {
  const due = isReminderDue(note);
  const timeUntil = getTimeUntilDue(note);
  const repeatLabel = note.repeatRule && note.repeatRule !== "none" ? getRepeatLabel(note.repeatRule) : null;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {due && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold animate-pulse">
          ⚠️ Due now
        </span>
      )}
      {timeUntil && !due && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium">
          🕐 {timeUntil}
        </span>
      )}
      {repeatLabel && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 font-medium">
          🔁 {repeatLabel}
        </span>
      )}
    </div>
  );
}
