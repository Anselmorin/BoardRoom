"use client";

import { useState } from "react";
import { Note, FamilyMember, Comment } from "@/lib/types";
import UserAvatar from "./UserAvatar";

interface NoteDetailProps {
  note: Note;
  author: FamilyMember | undefined;
  members: FamilyMember[];
  currentUser: FamilyMember | null;
  onLike: (noteId: string) => void;
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
  const likes = note.likes || [];
  const comments = note.comments || [];
  const hasLiked = currentUser ? likes.includes(currentUser.id) : false;

  const getMember = (id: string) => members.find((m) => m.id === id);

  const handleComment = () => {
    if (!commentText.trim() || !currentUser) return;
    onComment(note.id, commentText.trim());
    setCommentText("");
  };

  const likedByNames = likes.map((id) => getMember(id)?.name).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 dark:border-stone-700 animate-slide-up flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2">
            {author && (
              <UserAvatar name={author.name} color={author.color} photo={author.photo} size="sm" />
            )}
            <div>
              <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{author?.name || "Unknown"}</p>
              <p className="text-xs text-stone-400">{new Date(note.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && currentUser?.id === note.authorId && (
              <button onClick={onEdit} className="text-xs text-amber-500 hover:text-amber-400 px-2 py-1">Edit</button>
            )}
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-xl leading-none">×</button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="px-5 py-4">
            <p className="text-stone-800 dark:text-stone-200 text-base leading-relaxed whitespace-pre-wrap">{note.content}</p>
          </div>

          {/* Likes */}
          <div className="px-5 pb-3 flex items-center gap-3">
            <button
              onClick={() => onLike(note.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                hasLiked
                  ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                  : "bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              }`}
            >
              {hasLiked ? "❤️" : "🤍"} {hasLiked ? "Liked" : "Like"}
            </button>
            {likes.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {likes.map((likerId) => {
                    const liker = members.find(m => m.id === likerId);
                    return (
                      <div
                        key={likerId}
                        className="w-5 h-5 rounded-full border-2 border-white dark:border-stone-800 flex items-center justify-center text-[8px] text-white"
                        style={{ backgroundColor: liker?.color || '#f87171' }}
                        title={liker?.name}
                      >
                        ❤
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-stone-400">
                  {likedByNames.slice(0, 3).join(", ")}{likedByNames.length > 3 ? ` +${likedByNames.length - 3}` : ""}
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
                    {commenter && (
                      <UserAvatar name={commenter.name} color={commenter.color} photo={commenter.photo} size="sm" />
                    )}
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

        {/* Comment input */}
        {currentUser && (
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-700 flex gap-2 items-center">
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
              className="w-8 h-8 rounded-full bg-amber-500 text-stone-900 flex items-center justify-center text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors"
            >
              ↑
            </button>
          </div>
        )}

        {!currentUser && (
          <div className="px-4 py-3 border-t border-stone-200 dark:border-stone-700 text-center">
            <p className="text-xs text-stone-400">Tap your avatar to sign in and comment</p>
          </div>
        )}
      </div>
    </div>
  );
}
