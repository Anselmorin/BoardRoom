"use client";

import { Note, FamilyMember } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import ReminderBadge, { isReminderDue } from "./ReminderBadge";

interface ReminderNoteProps {
  note: Note;
  author: FamilyMember | undefined;
  onClick: () => void;
  index: number;
}

export default function ReminderNote({
  note,
  author,
  onClick,
  index,
}: ReminderNoteProps) {
  const { noteFont, theme } = useTheme();
  return (
    <button
      onClick={onClick}
      className="w-full text-left animate-slide-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={`relative p-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:bg-stone-200/60 dark:hover:bg-stone-700/60 border border-stone-200/30 dark:border-stone-700/30 flex items-start gap-3 ${isReminderDue(note) ? "bg-red-50/80 dark:bg-red-900/20 border-red-200/50" : "bg-stone-100/60 dark:bg-stone-800/60"}`}>
        {/* Color indicator bar */}
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: author?.color || "#888" }}
        />

        <div className="flex-1 min-w-0">
          <p
            className="text-stone-800 dark:text-stone-200 text-sm whitespace-pre-wrap leading-snug"
            style={{
              fontFamily: noteFont,
              fontSize: theme.fontStyle === "handwriting" ? "1.15rem" : undefined,
            }}
          >
            {note.content}
          </p>
          <ReminderBadge note={note} />
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-stone-400">
              {author?.name || "Unknown"}
            </span>
            {note.visibility === "private" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3 h-3 text-amber-400/70"
              >
                <path
                  fillRule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
