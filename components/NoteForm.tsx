"use client";

import { useState } from "react";
import { Note, FamilyMember, NoteInput, RepeatRule } from "@/lib/types";

interface NoteFormProps {
  note?: Note | null;
  familyMembers: FamilyMember[];
  currentUserId: string;
  onSave: (data: NoteInput) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function NoteForm({
  note,
  familyMembers,
  currentUserId,
  onSave,
  onDelete,
  onClose,
}: NoteFormProps) {
  const [type, setType] = useState<"sticky" | "reminder">(
    note?.type || "sticky"
  );
  const [content, setContent] = useState(note?.content || "");
  const [visibility, setVisibility] = useState<"public" | "private">(
    note?.visibility || "public"
  );
  const [recipientId, setRecipientId] = useState(note?.recipientId || "");
  const [dueAt, setDueAt] = useState(note?.dueAt ? new Date(note.dueAt).toISOString().slice(0, 16) : "");
  const [repeatRule, setRepeatRule] = useState<RepeatRule>(note?.repeatRule || "none");
  const [directedTo, setDirectedTo] = useState<string[]>(note?.recipientIds || []);

  const otherMembers = familyMembers.filter((m) => m.id !== currentUserId);

  const toggleDirected = (memberId: string) => {
    setDirectedTo((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({
      id: note?.id,
      content: content.trim(),
      type,
      visibility,
      recipientId: visibility === "private" ? recipientId : undefined,
      recipientIds: visibility === "public" && directedTo.length > 0 ? directedTo : undefined,
      dueAt: type === "reminder" && dueAt ? new Date(dueAt).toISOString() : undefined,
      repeatRule: type === "reminder" ? repeatRule : "none",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-stone-100 rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 animate-slide-up">
        <div className="p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">
            {note ? "Edit Note" : "New Note"}
          </h2>

          {/* Type selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setType("sticky")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                type === "sticky"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-stone-200/50 text-stone-400 border border-stone-300/50 hover:bg-stone-200"
              }`}
            >
              📝 Sticky Note
            </button>
            <button
              onClick={() => setType("reminder")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                type === "reminder"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "bg-stone-200/50 text-stone-400 border border-stone-300/50 hover:bg-stone-200"
              }`}
            >
              📌 Reminder
            </button>
          </div>

          {/* Content textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full h-32 p-3 rounded-lg bg-white/50 border border-stone-300/50 text-stone-800 placeholder-stone-500 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/25"
            autoFocus
          />

          {/* Directed to (public notes) */}
          {visibility === "public" && (
            <div className="mt-4">
              <label className="text-sm text-stone-400 mb-2 block">
                Directed to (optional):
              </label>
              <div className="flex gap-2 flex-wrap">
                {familyMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => toggleDirected(member.id)}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition-colors border-2 ${
                      directedTo.includes(member.id)
                        ? "text-stone-800"
                        : "border-transparent bg-stone-200/50 text-stone-400 hover:bg-stone-200"
                    }`}
                    style={
                      directedTo.includes(member.id)
                        ? { borderColor: member.color, backgroundColor: member.color + "20" }
                        : undefined
                    }
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visibility toggle */}
          <div className="mt-4">
            <label className="text-sm text-stone-400 mb-2 block">
              Who can see this?
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibility("public")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  visibility === "public"
                    ? "bg-green-500/20 text-green-400 border border-green-500/40"
                    : "bg-stone-200/50 text-stone-400 border border-stone-300/50 hover:bg-stone-200"
                }`}
              >
                👨‍👩‍👧‍👦 Everyone
              </button>
              <button
                onClick={() => {
                  setVisibility("private");
                  if (!recipientId && otherMembers.length > 0) {
                    setRecipientId(otherMembers[0].id);
                  }
                }}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  visibility === "private"
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                    : "bg-stone-200/50 text-stone-400 border border-stone-300/50 hover:bg-stone-200"
                }`}
              >
                🔒 Private
              </button>
            </div>
          </div>

          {/* Recipient picker */}
          {visibility === "private" && otherMembers.length > 0 && (
            <div className="mt-3">
              <label className="text-sm text-stone-400 mb-2 block">
                Send to:
              </label>
              <div className="flex gap-2 flex-wrap">
                {otherMembers.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setRecipientId(member.id)}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-full text-sm transition-colors border-2 ${
                      recipientId === member.id
                        ? "bg-stone-600 text-stone-800"
                        : "border-transparent bg-stone-200/50 text-stone-400 hover:bg-stone-200"
                    }`}
                    style={
                      recipientId === member.id
                        ? { borderColor: member.color }
                        : undefined
                    }
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: member.color }}
                    />
                    {member.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reminder timing (only for reminders) */}
        {type === "reminder" && (
          <div className="px-4 pb-3 space-y-3 border-b border-stone-200">
            <div>
              <label className="text-xs text-stone-400 uppercase tracking-wide mb-2 block">Due date & time (optional)</label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={e => setDueAt(e.target.value)}
                className="w-full bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-xs text-stone-400 uppercase tracking-wide mb-2 block">Repeat</label>
              <select
                value={repeatRule}
                onChange={e => setRepeatRule(e.target.value as RepeatRule)}
                className="w-full bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="none">No repeat</option>
                <option value="hourly">Every hour</option>
                <option value="every2h">Every 2 hours</option>
                <option value="every4h">Every 4 hours</option>
                <option value="every6h">Every 6 hours</option>
                <option value="every8h">Every 8 hours</option>
                <option value="every12h">Every 12 hours</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between p-4 border-t border-stone-200">
          <div>
            {note && onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-stone-400 hover:bg-stone-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="px-6 py-2 text-sm font-medium bg-amber-500 text-stone-900 rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {note ? "Save" : "Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
