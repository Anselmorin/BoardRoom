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
import ThemePanel from "@/components/ThemePanel";
import AccountPage from "@/components/AccountPage";

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
  const [showTheme, setShowTheme] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [accountMember, setAccountMember] = useState<FamilyMember | null>(null);

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
    } else if (pendingAction === "settings" && user.isAdmin) {
      setShowManageFamily(true);
    } else if (pendingAction === "account") {
      setAccountMember(user);
      setShowAccount(true);
    }
    setPendingAction("");
  }, [pendingAction]);

  const handleAvatarTap = useCallback((member?: FamilyMember) => {
    // If tapping a specific member avatar in the row, auth as that member
    // If no member passed, open auth to pick who you are
    setPendingAction("account");
    setShowAuth(true);
  }, []);

  const handleUpdatePhoto = useCallback((memberId: string, photo: string) => {
    if (!family) return;
    const updated = {
      ...family,
      members: family.members.map((m) =>
        m.id === memberId ? { ...m, photo } : m
      ),
    };
    saveFamily(updated);
    setFamily(updated);
    // Update accountMember too
    setAccountMember((prev) => prev ? { ...prev, photo } : prev);
  }, [family]);

  const handleChangePin = useCallback((memberId: string, newPin: string) => {
    if (!family) return;
    const updated = {
      ...family,
      members: family.members.map((m) =>
        m.id === memberId ? { ...m, pin: newPin } : m
      ),
    };
    saveFamily(updated);
    setFamily(updated);
  }, [family]);

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
              recipientIds: data.recipientIds,
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
        recipientIds: data.recipientIds,
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

  // Filter notes: show public notes always, show private only if logged in
  // Public board only shows public notes — private notes live in account page only
  const visibleNotes = (family ? notes : []).filter((n) => n.visibility === "public");

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-stone-900 flex flex-col transition-colors">
      {/* Header — family board */}
      <header className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border-b border-stone-200/50 dark:border-stone-700/50">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🏠</div>
          <div>
            <h1 className="text-xl font-bold text-amber-600">BoardRoom</h1>
            <p className="text-xs text-stone-400">{family ? `${family.name} Family` : "Family Board"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Clock />
          <div className="h-8 w-px bg-stone-200 dark:bg-stone-700" />

          {/* Family member avatars — tap to open account */}
          {family && family.members.length > 0 && (
            <div className="flex -space-x-2 mr-2">
              {family.members.slice(0, 6).map((m) => (
                <div key={m.id} title={`${m.name} — tap to open account`}>
                  <UserAvatar
                    name={m.name}
                    color={m.color}
                    photo={m.photo}
                    size="sm"
                    onClick={handleAvatarTap}
                  />
                </div>
              ))}
              {family.members.length > 6 && (
                <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xs text-stone-500 font-medium">
                  +{family.members.length - 6}
                </div>
              )}
            </div>
          )}

          {/* Theme button */}
          <button
            onClick={() => setShowTheme(true)}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            title="Themes"
          >
            🎨
          </button>

          {/* Settings gear — admin only, requires auth */}
          <button
            onClick={() => {
              requireAuth("settings", () => {
                setShowManageFamily(true);
              });
            }}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-lg transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
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
      {showNoteForm && currentUser && family && (
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
      {showManageFamily && family && (
        <ManageFamily
          family={family}
          onAddMember={handleAddMember}
          onClose={() => setShowManageFamily(false)}
        />
      )}

      {/* Theme panel */}
      {showTheme && (
        <ThemePanel onClose={() => setShowTheme(false)} />
      )}

      {/* Account page */}
      {showAccount && accountMember && family && (
        <AccountPage
          member={accountMember}
          privateNotes={notes.filter(
            (n) =>
              n.visibility === "private" &&
              (n.recipientId === accountMember.id || n.authorId === accountMember.id)
          )}
          allMembers={family.members}
          onUpdatePhoto={handleUpdatePhoto}
          onChangePin={handleChangePin}
          onClose={() => { setShowAccount(false); setAccountMember(null); }}
        />
      )}
    </div>
  );
}
