"use client";

import { Note, FamilyMember } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { PixelHeart } from "./PixelHeart";

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

          {/* Likes (colored hearts) + Comments count */}
          <div className="ml-auto flex items-center gap-2">
            {comments.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-stone-400">
                💬 {comments.length}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onLike?.(note.id); }}
              className="flex items-center gap-1 text-xs transition-colors"
            >
              {likes.length > 0 ? (
                <span className="flex -space-x-0.5 items-center">
                  {likes.slice(0, 4).map((likerId) => {
                    const liker = members.find(m => m.id === likerId);
                    return (
                      <span key={likerId} title={liker?.name} className="drop-shadow-sm">
                        <PixelHeart color={liker?.color || '#f87171'} size={12} />
                      </span>
                    );
                  })}
                  {likes.length > 4 && (
                    <span className="text-[9px] text-stone-400 ml-0.5">+{likes.length - 4}</span>
                  )}
                </span>
              ) : (
                <span className="opacity-20">
                  <PixelHeart color="#888" size={12} />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </button>
  );
}
