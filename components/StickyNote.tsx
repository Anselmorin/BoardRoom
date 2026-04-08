"use client";

import { Note, FamilyMember } from "@/lib/types";
import { useTheme } from "@/lib/theme";

interface StickyNoteProps {
  note: Note;
  author: FamilyMember | undefined;
  members: FamilyMember[];
  currentUserId?: string;
  onClick: () => void;
  onLike?: (noteId: string) => void;
  index: number;
}

const ROTATIONS = [-2, 1, -1, 2, 0, -1.5, 1.5];

export default function StickyNote({
  note,
  author,
  members,
  currentUserId,
  onClick,
  onLike,
  index,
}: StickyNoteProps) {
  const likes = note.likes || [];
  const comments = note.comments || [];
  const hasLiked = currentUserId ? likes.includes(currentUserId) : false;
  const { noteFont, theme } = useTheme();
  const directedMembers = (note.recipientIds || [])
    .map((id) => members.find((m) => m.id === id))
    .filter(Boolean) as FamilyMember[];
  const rotation = ROTATIONS[index % ROTATIONS.length];

  return (
    <button
      onClick={onClick}
      className="w-full text-left animate-note-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="relative p-4 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] bg-stone-100/80 dark:bg-stone-800/80 border border-stone-200/50 dark:border-stone-700/50 min-h-[180px] flex flex-col"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {/* Color strip — split by directed-to members, or author color */}
        <div className="absolute top-0 left-0 right-0 h-2 rounded-t-lg overflow-hidden flex">
          {directedMembers.length > 0 ? (
            directedMembers.map((m, i) => (
              <div
                key={m.id}
                className={i === 0 ? "rounded-tl-lg" : i === directedMembers.length - 1 ? "rounded-tr-lg" : ""}
                style={{
                  backgroundColor: m.color,
                  flex: 1,
                }}
              />
            ))
          ) : (
            <div
              className="rounded-t-lg w-full h-full"
              style={{ backgroundColor: author?.color || "#888" }}
            />
          )}
        </div>

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
        <p
          className="text-stone-800 dark:text-stone-200 mt-3 flex-1 whitespace-pre-wrap leading-relaxed"
          style={{
            fontFamily: noteFont,
            fontSize: theme.fontStyle === "handwriting" ? "1.3rem" : undefined,
          }}
        >
          {note.content}
        </p>

        {/* Directed-to names, or author if not directed */}
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-stone-200/50 dark:border-stone-700/50 flex-wrap">
          {directedMembers.length > 0 ? (
            <>
              <span className="text-xs text-stone-400 mr-0.5">To:</span>
              {directedMembers.map((m, i) => (
                <span key={m.id} className="flex items-center gap-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-xs text-stone-500 font-medium">
                    {m.name}{i < directedMembers.length - 1 ? "," : ""}
                  </span>
                </span>
              ))}
            </>
          ) : (
            <>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: author?.color || "#888" }}
              />
              <span className="text-xs text-stone-400">
                {author?.name || "Unknown"}
              </span>
            </>
          )}

          {/* Likes + Comments */}
          <div className="ml-auto flex items-center gap-2">
            {comments.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-stone-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 001.33 0l1.713-3.293a.783.783 0 01.642-.413 41.102 41.102 0 003.55-.414c1.437-.232 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0010 2z" clipRule="evenodd" />
                </svg>
                {comments.length}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onLike?.(note.id); }}
              className={`flex items-center gap-0.5 text-xs transition-colors ${
                hasLiked ? "text-red-400" : "text-stone-400 hover:text-red-400"
              }`}
            >
              {hasLiked ? "❤️" : "🤍"}
              {likes.length > 0 && <span>{likes.length}</span>}
            </button>
          </div>
        </div>
      </div>
    </button>
  );
}
