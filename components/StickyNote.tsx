"use client";

import React from "react";
import { Note, FamilyMember } from "@/lib/types";
import { useTheme } from "@/lib/theme";
import { PixelReaction, ReactionPicker } from "./PixelHeart";

interface StickyNoteProps {
  note: Note;
  author: FamilyMember | undefined;
  members: FamilyMember[];
  currentUserId?: string;
  onClick: () => void;
  onLike?: (noteId: string, type: "heart" | "thumbsup") => void;
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
  const [showPicker, setShowPicker] = React.useState(false);
  const comments = note.comments || [];
  const { noteFont, theme } = useTheme();
  const reactions = note.reactions || [];
  // Merge legacy likes as heart reactions
  const allReactions = [
    ...reactions,
    ...(note.likes || []).filter(id => !reactions.find(r => r.memberId === id)).map(id => ({ memberId: id, type: 'heart' as const }))
  ];
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

          {/* Reactions (fanned playing-card style) + Comments count */}
          <div className="ml-auto flex items-center gap-2">
            {comments.length > 0 && (
              <span className="text-[10px] text-stone-400">💬{comments.length}</span>
            )}
            <div className="relative">
            {showPicker && (
              <ReactionPicker
                currentColor={author?.color || '#888'}
                onPick={(type) => { onLike?.(note.id, type); setShowPicker(false); }}
                onClose={() => setShowPicker(false)}
              />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setShowPicker(p => !p); }}
              className="relative flex items-center"
              style={{ minWidth: allReactions.length > 0 ? `${8 + allReactions.slice(0, 5).length * 8}px` : '14px' }}
            >
              {allReactions.length > 0 ? (
                allReactions.slice(0, 5).map((r, i) => {
                  const member = members.find(m => m.id === r.memberId);
                  const total = Math.min(allReactions.length, 5);
                  const angle = total === 1 ? 0 : (i - (total - 1) / 2) * 12;
                  return (
                    <span
                      key={r.memberId}
                      title={member?.name}
                      className="absolute"
                      style={{
                        left: `${i * 8}px`,
                        zIndex: i,
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'bottom center',
                        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
                      }}
                    >
                      <PixelReaction type={r.type} color={member?.color || '#f87171'} size={13} />
                    </span>
                  );
                })
              ) : (
                <span className="opacity-20">
                  <PixelReaction type="heart" color="#888" size={12} />
                </span>
              )}
            </button>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
