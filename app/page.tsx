"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Family, FamilyMember, Note, NoteInput } from "@/lib/types";
import {
  getFamily,
  setFamily as saveFamily,
  getNotes,
  setNotes as saveNotes,
  getSession,
  clearSession,
} from "@/lib/storage";
import Header from "@/components/Header";
import NoteBoard from "@/components/NoteBoard";
import NoteForm from "@/components/NoteForm";
import ManageFamily from "@/components/ManageFamily";

export default function HomePage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showManageFamily, setShowManageFamily] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fam = getFamily();
    if (!fam) {
      router.replace("/setup");
      return;
    }

    const sessionId = getSession();
    if (!sessionId) {
      router.replace("/login");
      return;
    }

    const user = fam.members.find((m) => m.id === sessionId);
    if (!user) {
      clearSession();
      router.replace("/login");
      return;
    }

    setFamily(fam);
    setCurrentUser(user);
    setNotes(getNotes());
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const handleSaveNote = (data: NoteInput) => {
    const allNotes = getNotes();
    if (data.id) {
      const updated = allNotes.map((n) =>
        n.id === data.id
          ? {
              ...n,
              content: data.content,
              type: data.type,
              visibility: data.visibility,
              recipientId: data.recipientId,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      saveNotes(updated);
      setNotes(updated);
    } else {
      const newNote: Note = {
        id: crypto.randomUUID(),
        authorId: currentUser!.id,
        content: data.content,
        type: data.type,
        visibility: data.visibility,
        recipientId: data.recipientId,
        color: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newNote, ...allNotes];
      saveNotes(updated);
      setNotes(updated);
    }
    setShowNoteForm(false);
    setEditingNote(null);
  };

  const handleDeleteNote = () => {
    if (!editingNote) return;
    const updated = getNotes().filter((n) => n.id !== editingNote.id);
    saveNotes(updated);
    setNotes(updated);
    setShowNoteForm(false);
    setEditingNote(null);
  };

  const handleAddMember = (
    member: Omit<FamilyMember, "id" | "isAdmin">
  ) => {
    if (!family) return;
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
      isAdmin: false,
    };
    const updated = {
      ...family,
      members: [...family.members, newMember],
    };
    saveFamily(updated);
    setFamily(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-amber-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!family || !currentUser) return null;

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <Header
        family={family}
        currentUser={currentUser}
        onLogout={handleLogout}
        onManageFamily={() => setShowManageFamily(true)}
      />
      <NoteBoard
        notes={notes}
        members={family.members}
        currentUserId={currentUser.id}
        onNoteClick={(note) => {
          setEditingNote(note);
          setShowNoteForm(true);
        }}
        onNewNote={() => {
          setEditingNote(null);
          setShowNoteForm(true);
        }}
      />

      {showNoteForm && (
        <NoteForm
          note={editingNote}
          familyMembers={family.members}
          currentUserId={currentUser.id}
          onSave={handleSaveNote}
          onDelete={editingNote ? handleDeleteNote : undefined}
          onClose={() => {
            setShowNoteForm(false);
            setEditingNote(null);
          }}
        />
      )}

      {showManageFamily && (
        <ManageFamily
          family={family}
          onAddMember={handleAddMember}
          onClose={() => setShowManageFamily(false)}
        />
      )}
    </div>
  );
}
