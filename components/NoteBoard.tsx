"use client";

import { Note, FamilyMember } from "@/lib/types";
import StickyNote from "./StickyNote";
import ReminderNote from "./ReminderNote";

interface NoteBoardProps {
  notes: Note[];
  members: FamilyMember[];
  currentUserId: string;
  onNoteClick: (note: Note) => void;
  onNewNote: () => void;
}

export default function NoteBoard({
  notes,
  members,
  currentUserId,
  onNoteClick,
  onNewNote,
}: NoteBoardProps) {
  const getMember = (id: string) => members.find((m) => m.id === id);

  // Show public notes + private notes where user is author or recipient
  const visibleNotes = notes.filter(
    (note) =>
      note.visibility === "public" ||
      note.authorId === currentUserId ||
      note.recipientId === currentUserId
  );

  const stickyNotes = visibleNotes.filter((n) => n.type === "sticky");
  const reminderNotes = visibleNotes.filter((n) => n.type === "reminder");

  return (
    <div className="flex-1 flex gap-6 p-6 overflow-hidden">
      {/* Left: Sticky Notes */}
      <div className="flex-[2] overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">
            Notes
          </h2>
          <span className="text-xs text-stone-400">
            {stickyNotes.length} notes
          </span>
        </div>

        {stickyNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-stone-400">
            <p className="text-lg mb-1">No notes yet</p>
            <p className="text-sm">Tap the + button to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {stickyNotes.map((note, i) => (
              <StickyNote
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

      {/* Divider */}
      <div className="w-px bg-stone-200/50 self-stretch" />

      {/* Right: Reminders */}
      <div className="flex-1 overflow-y-auto pl-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider">
            Reminders
          </h2>
          <span className="text-xs text-stone-400">
            {reminderNotes.length}
          </span>
        </div>

        {reminderNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-stone-400">
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

      {/* Floating Action Button */}
      <button
        onClick={onNewNote}
        className="fixed bottom-8 right-8 w-14 h-14 bg-amber-500 text-stone-900 rounded-full shadow-lg hover:bg-amber-400 transition-all hover:shadow-xl hover:scale-105 flex items-center justify-center text-2xl font-bold"
      >
        +
      </button>
    </div>
  );
}
