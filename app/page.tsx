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
  const [showQuickPick, setShowQuickPick] = useState(false);
  const [pendingAction, setPendingAction] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    const fam = getFamily();
    if (!fam) {
      // Don't redirect — show empty board with setup prompt
      setNeedsSetup(true);
      setLoading(false);
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

  // For public actions: just pick your name, no PIN
  const quickPick = useCallback((action: string, callback: () => void) => {
    if (currentUser) {
      callback();
    } else if (family && family.members.length > 0) {
      setPendingAction(action);
      setShowQuickPick(true);
    }
  }, [currentUser, family]);

  // For private actions: require full PIN auth
  const requireAuth = useCallback((action: string, callback: () => void) => {
    if (currentUser) {
      callback();
    } else {
      setPendingAction(action);
      setShowAuth(true);
    }
  }, [currentUser]);

  const handleQuickPick = useCallback((user: FamilyMember) => {
    setCurrentUser(user);
    // Don't save to session — quick pick is temporary
    setShowQuickPick(false);
    if (pendingAction === "new-note") {
      setEditingNote(null);
      setShowNoteForm(true);
    }
    setPendingAction("");
  }, [pendingAction]);

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
      {needsSetup ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="text-6xl">🏠</div>
          <h2 className="text-2xl font-bold text-stone-800">Welcome to BoardRoom!</h2>
          <p className="text-stone-400">Set up your family to start posting.</p>
          <button
            onClick={() => router.push("/setup")}
            className="px-6 py-3 bg-amber-500 text-stone-900 rounded-xl font-medium hover:bg-amber-400 transition-colors"
          >
            Set Up Family
          </button>
        </div>
      ) : family && (
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
            // Public posting — just pick your name, no PIN
            quickPick("new-note", () => {
              setEditingNote(null);
              setShowNoteForm(true);
            });
          }}
        />
      )}

      {/* Quick pick popup — no PIN, just pick your name */}
      {showQuickPick && family && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowQuickPick(false); setPendingAction(""); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-stone-800 mb-1 text-center">Who are you?</h2>
            <p className="text-xs text-stone-400 mb-4 text-center">Tap your name to post</p>
            <div className="grid grid-cols-3 gap-3">
              {family.members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleQuickPick(m)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-amber-50 transition-colors"
                >
                  <UserAvatar name={m.name} color={m.color} size="lg" />
                  <span className="text-xs text-stone-600">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth popup — full PIN, for private stuff */}
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
