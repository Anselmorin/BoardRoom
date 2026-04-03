"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Family, FamilyMember, Note, NoteInput, ROLE_INFO } from "@/lib/types";
import {
  getFamily,
  setFamily as saveFamily,
  getNotes,
  setNotes as saveNotes,
  getSession,
  setSession,
  clearSession,
} from "@/lib/storage";
import NoteBoard from "@/components/NoteBoard";
import NoteForm from "@/components/NoteForm";
import ManageFamily from "@/components/ManageFamily";
import AuthPopup from "@/components/AuthPopup";
import Clock from "@/components/Clock";
import UserAvatar from "@/components/UserAvatar";

export default function HomePage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showManageFamily, setShowManageFamily] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fam = getFamily();
    if (!fam) {
      router.replace("/setup");
      return;
    }
    setFamily(fam);
    setNotes(getNotes());

    // Check if there's an existing session
    const sessionId = getSession();
    if (sessionId) {
      const user = fam.members.find((m) => m.id === sessionId);
      if (user) setCurrentUser(user);
      else clearSession();
    }

    setLoading(false);
  }, [router]);

  const requireAuth = useCallback((action: string, callback: () => void) => {
    if (currentUser) {
      callback();
    } else {
      setPendingAction(action);
      setShowAuth(true);
    }
  }, [currentUser]);

  const handleAuth = useCallback((user: FamilyMember) => {
    setCurrentUser(user);
    setSession(user.id);
    setShowAuth(false);

    // Execute pending action
    if (pendingAction === "new-note") {
      setEditingNote(null);
      setShowNoteForm(true);
    }
    setPendingAction("");
  }, [pendingAction]);

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
  };

  const handleSaveNote = (data: NoteInput) => {
    if (!currentUser) return;
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
        authorId: currentUser.id,
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
    member: Omit<FamilyMember, "id">
  ) => {
    if (!family) return;
    const newMember: FamilyMember = {
      ...member,
      id: crypto.randomUUID(),
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
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (!family) return null;

  // Filter notes: show public notes always, show private only if logged in
  const visibleNotes = notes.filter((n) => {
    if (n.visibility === "public") return true;
    if (!currentUser) return false;
    if (n.authorId === currentUser.id) return true;
    if (n.recipientId === currentUser.id) return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col">
      {/* Header — no login required */}
      <header className="flex items-center justify-between px-6 py-3 bg-white/80 backdrop-blur-sm border-b border-stone-200/50">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏠</div>
          <div>
            <h1 className="text-xl font-bold text-amber-600">BoardRoom</h1>
            <p className="text-xs text-stone-400">{family.name} Family</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Clock />
          <div className="h-8 w-px bg-stone-200" />

          {currentUser ? (
            <div className="flex items-center gap-3">
              <UserAvatar name={currentUser.name} color={currentUser.color} />
              <div className="text-sm">
                <p className="text-stone-800 font-medium">{currentUser.name}</p>
                {currentUser.isAdmin && (
                  <button
                    onClick={() => setShowManageFamily(true)}
                    className="text-xs text-amber-500 hover:text-amber-600"
                  >
                    Manage Family
                  </button>
                )}
                {currentUser.role && ROLE_INFO[currentUser.role] && (
                  <span className="text-xs text-stone-400">
                    {ROLE_INFO[currentUser.role].emoji} {ROLE_INFO[currentUser.role].label}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setPendingAction(""); setShowAuth(true); }}
              className="px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 border border-amber-300 rounded-lg transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Board — always visible */}
      <NoteBoard
        notes={visibleNotes}
        members={family.members}
        currentUserId={currentUser?.id ?? ""}
        onNoteClick={(note) => {
          if (currentUser && note.authorId === currentUser.id) {
            setEditingNote(note);
            setShowNoteForm(true);
          }
        }}
        onNewNote={() => {
          requireAuth("new-note", () => {
            setEditingNote(null);
            setShowNoteForm(true);
          });
        }}
      />

      {/* Auth popup */}
      {showAuth && family && (
        <AuthPopup
          family={family}
          onAuth={handleAuth}
          onClose={() => { setShowAuth(false); setPendingAction(""); }}
          action={pendingAction === "new-note" ? "Post a new note" : undefined}
        />
      )}

      {/* Note form */}
      {showNoteForm && currentUser && (
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

      {/* Manage family */}
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
