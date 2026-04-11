"use client";

import { useState } from "react";
import { Note, FamilyMember } from "@/lib/types";
import UserAvatar from "./UserAvatar";
import { PixelReaction } from "./PixelHeart";

interface NoteDetailProps {
  note: Note;
  author: FamilyMember | undefined;
  members: FamilyMember[];
  currentUser: FamilyMember | null;
  onLike: (noteId: string, type: "heart" | "thumbsup") => void;
  onComment: (noteId: string, content: string) => void;
  onEdit?: () => void;
  onClose: () => void;
}

export default function NoteDetail({
  note,
  author,
  members,
  currentUser,
  onLike,
  onComment,
  onEdit,
  onClose,
}: NoteDetailProps) {
  const [commentText, setCommentText] = useState("");
  const comments = note.comments || [];
  const reactions = note.reactions || [];
  // Merge legacy likes as heart reactions
  const allReactions = [
    ...reactions,
    ...(note.likes || []).filter(id => !reactions.find(r => r.memberId === id)).map(id => ({ memberId: id, type: 'heart' as const }))
  ];

  const getMember = (id: string) => members.find((m) => m.id === id);

  const handleComment = () => {
    if (!commentText.trim()) return;
    onComment(note.id, commentText.trim());
    setCommentText("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 dark:border-stone-700 animate-slide-up flex flex-col"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700 shrink-0">
          <div className="flex items-center gap-2">
            {author && <UserAvatar name={author.name} color={author.color} photo={author.photo} size="sm" />}
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{author?.name || "Unknown"}</p>
              <p className="text-xs text-stone-400">{new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && <button onClick={onEdit} className="text-xs text-amber-500 hover:text-amber-400 px-2 py-1">Edit</button>}
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-xl leading-none">×</button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Note content */}
          <div className="px-5 py-4">
            <p className="text-stone-800 dark:text-stone-200 text-base leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </div>

          {/* Reactions row */}
          <div className="px-5 pb-4 flex items-center gap-2 flex-wrap">
            {/* Heart button */}
            <button
              onClick={() => onLike(note.id, "heart")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400"
            >
              <span className="text-base leading-none">❤️</span>
              <span>Heart</span>
            </button>
            {/* Like (thumbs up) button */}
            <button
              onClick={() => onLike(note.id, "thumbsup")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-400"
            >
              <span className="text-base leading-none">👍</span>
              <span>Like</span>
            </button>

            {/* Stacked reactions */}
            {allReactions.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-0.5">
                  {allReactions.map((r) => {
                    const member = getMember(r.memberId);
                    return (
                      <span key={r.memberId} title={`${member?.name}: ${r.type}`}>
                        <PixelReaction type={r.type} color={member?.color || '#f87171'} size={16} />
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-stone-400">
                  {allReactions.map(r => getMember(r.memberId)?.name).filter(Boolean).slice(0, 3).join(", ")}
                </p>
              </div>
            )}
          </div>

          {/* Comments */}
          {comments.length > 0 && (
            <div className="px-5 pb-4 border-t border-stone-100 dark:border-stone-700 pt-3 space-y-3">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Comments</p>
              {comments.map((c) => {
                const commenter = getMember(c.authorId);
                return (
                  <div key={c.id} className="flex gap-2">
                    {commenter && <UserAvatar name={commenter.name} color={commenter.color} photo={commenter.photo} size="sm" />}
                    <div className="flex-1 bg-stone-50 dark:bg-stone-700/50 rounded-xl px-3 py-2">
                      <p className="text-xs font-medium text-stone-600 dark:text-stone-300 mb-0.5">{commenter?.name || "Unknown"}</p>
                      <p className="text-sm text-stone-800 dark:text-stone-200">{c.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comment input — only show if logged in */}
        {currentUser ? (
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-700 flex gap-2 items-center shrink-0">
            <UserAvatar name={currentUser.name} color={currentUser.color} photo={currentUser.photo} size="sm" />
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder="Add a comment..."
              className="flex-1 bg-stone-100 dark:bg-stone-700 rounded-full px-4 py-2 text-sm text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="w-8 h-8 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center text-sm font-bold disabled:opacity-30 hover:bg-amber-400 transition-colors"
            >
              ↑
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-700 text-center shrink-0">
            <p className="text-xs text-stone-400">Tap your avatar to sign in and comment</p>
          </div>
        )}
      </div>
    </div>
  );
}
