"use client";

import { Note, FamilyMember } from "@/lib/types";

interface StickyNoteProps {
  note: Note;
  author: FamilyMember | undefined;
  onClick: () => void;
  index: number;
}

const ROTATIONS = [-2, 1, -1, 2, 0, -1.5, 1.5];

export default function StickyNote({
  note,
  author,
  onClick,
  index,
}: StickyNoteProps) {
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <button
      onClick={onClick}
      className="w-full text-left animate-note-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="relative p-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] bg-stone-800/80 border border-stone-700/50 min-h-[180px] flex flex-col"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Author color strip */}
        <div
          className="absolute top-0 left-0 right-0 h-2 rounded-t-lg"
          style={{ backgroundColor: author?.color || "#888" }}
        />

        {/* Private lock icon */}
        {note.visibility === "private" && (
          <div className="absolute top-3 right-3 text-amber-400/70">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Content */}
        <p className="text-stone-200 text-base mt-3 flex-1 whitespace-pre-wrap leading-relaxed">
          {note.content}
        </p>

        {/* Author info */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-stone-700/50">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: author?.color || "#888" }}
          />
          <span className="text-xs text-stone-400">
            {author?.name || "Unknown"}
          </span>
        </div>
      </div>
    </button>
  );
}
