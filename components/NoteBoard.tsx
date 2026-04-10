"use client";

import { Note, FamilyMember } from "@/lib/types";
import StickyNote from "./StickyNote";
import ReminderNote from "./ReminderNote";

interface NoteBoardProps {
  notes: Note[];
  members: FamilyMember[];
  currentUserId: string;
  onNoteClick: (note: Note) => void;
  onLike: (noteId: string, type: "heart" | "thumbsup") => void;
  onNewNote: () => void;
}

export default function NoteBoard({
  notes,
  members,
  currentUserId,
  onNoteClick,
  onLike,
  onNewNote,
}: NoteBoardProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  const stickyNotes = notes.filter((n) => n.type === "sticky");
  const reminderNotes = notes.filter((n) => n.type === "reminder");

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tabs for mobile — stickies and reminders stacked */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">

        {/* Sticky Notes */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              📝 Notes ({stickyNotes.length})
            </h2>
          </div>

          {stickyNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-stone-400 dark:text-stone-500 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <p className="text-2xl mb-2">📝</p>
              <p className="text-sm">No notes yet</p>
              <p className="text-xs mt-1">Tap + to post one</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {stickyNotes.map((note, i) => (
                <StickyNote
                  key={note.id}
                  note={note}
                  author={getMember(note.authorId)}
                  members={members}
                  currentUserId={currentUserId}
                  onClick={() => onNoteClick(note)}
                  onLike={onLike}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Reminders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
              🔔 Reminders ({reminderNotes.length})
            </h2>
          </div>

          {reminderNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-stone-400 dark:text-stone-500 rounded-xl bg-stone-50 dark:bg-stone-800/50">
              <p className="text-sm">No reminders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminderNotes.map((note, i) => (
                <ReminderNote
                  key={note.id}
                  note={note}
                  author={getMember(note.authorId)}
                  onClick={() => onNoteClick(note)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onNewNote}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 text-stone-900 rounded-full shadow-lg hover:bg-amber-400 transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center text-2xl font-bold z-40"
      >
        +
      </button>
    </div>
  );
}
