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
import NoteDetail from "@/components/NoteDetail";
import TrackerPanel from "@/components/TrackerPanel";
import AuthStack from "@/components/AuthStack";

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
  const [detailNote, setDetailNote] = useState<Note | null>(null);
  const [showTracker, setShowTracker] = useState(false);
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [pendingReactionType, setPendingReactionType] = useState<"heart" | "thumbsup">("heart");
  const [pendingCommentPayload, setPendingCommentPayload] = useState<{ noteId: string; content: string } | null>(null);

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
    } else if (pendingAction === "like" && pendingLikeId) {
      // React with heart or thumbsup (don't persist as currentUser)
      const allNotes = getNotes();
      const updated = allNotes.map((n) => {
        if (n.id !== pendingLikeId) return n;
        const reactions = n.reactions || [];
        const existingIdx = reactions.findIndex(r => r.memberId === user.id);
        let newReactions;
        if (existingIdx >= 0 && reactions[existingIdx].type === pendingReactionType) {
          // Same type — remove (toggle off)
          newReactions = reactions.filter((_, i) => i !== existingIdx);
        } else if (existingIdx >= 0) {
          // Different type — replace
          newReactions = reactions.map((r, i) => i === existingIdx ? { memberId: user.id, type: pendingReactionType } : r);
        } else {
          // New reaction
          newReactions = [...reactions, { memberId: user.id, type: pendingReactionType }];
        }
        return { ...n, reactions: newReactions };
      });
      saveNotes(updated);
      setNotes(updated);
      setDetailNote(prev => prev?.id === pendingLikeId ? updated.find(n => n.id === pendingLikeId) || null : prev);
      setPendingLikeId(null);
      setCurrentUser(null); // don't stay logged in
    } else if (pendingAction === "comment" && pendingCommentPayload) {
      const { noteId, content } = pendingCommentPayload;
      const newComment = { id: crypto.randomUUID(), authorId: user.id, content, createdAt: new Date().toISOString() };
      const allNotes = getNotes();
      const updated = allNotes.map((n) => n.id === noteId ? { ...n, comments: [...(n.comments || []), newComment] } : n);
      saveNotes(updated);
      setNotes(updated);
      setDetailNote(prev => prev?.id === noteId ? updated.find(n => n.id === noteId) || null : prev);
      setPendingCommentPayload(null);
      setCurrentUser(null); // don't stay logged in
    }
    setPendingAction("");
  }, [pendingAction, pendingLikeId, pendingCommentPayload]);

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

  const handleUpdateMember = useCallback((member: FamilyMember) => {
    if (!family) return;
    const updated = {
      ...family,
      members: family.members.map((m) => m.id === member.id ? member : m),
    };
    saveFamily(updated);
    setFamily(updated);
  }, [family]);

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
              dueAt: data.dueAt,
              repeatRule: data.repeatRule,
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
        dueAt: data.dueAt,
        repeatRule: data.repeatRule,
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

  const handleLike = useCallback((noteId: string) => {
    if (!currentUser) return;
    const allNotes = getNotes();
    const updated = allNotes.map((n) => {
      if (n.id !== noteId) return n;
      const likes = n.likes || [];
      const hasLiked = likes.includes(currentUser.id);
      return { ...n, likes: hasLiked ? likes.filter((id) => id !== currentUser.id) : [...likes, currentUser.id] };
    });
    saveNotes(updated);
    setNotes(updated);
    setDetailNote(prev => prev?.id === noteId ? updated.find(n => n.id === noteId) || null : prev);
  }, [currentUser]);

  const handleComment = useCallback((noteId: string, content: string) => {
    if (!currentUser) return;
    const allNotes = getNotes();
    const newComment = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
    };
    const updated = allNotes.map((n) => {
      if (n.id !== noteId) return n;
      return { ...n, comments: [...(n.comments || []), newComment] };
    });
    saveNotes(updated);
    setNotes(updated);
    setDetailNote(prev => prev?.id === noteId ? updated.find(n => n.id === noteId) || null : prev);
  }, [currentUser]);

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
      {/* Header — mobile-first compact */}
      <header className="flex items-center justify-between px-3 py-2 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2">
          <div className="text-xl">🏠</div>
          <div>
            <h1 className="text-base font-bold text-amber-600 leading-tight">BoardRoom</h1>
            <p className="text-[10px] text-stone-400 leading-tight">{family ? `${family.name} Family` : "Family Board"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock />

          {/* Family member avatars — tap to open account */}
          {family && family.members.length > 0 && (
            <div className="flex -space-x-1.5">
              {family.members.slice(0, 4).map((m) => (
                <div key={m.id} title={m.name} className="relative">
                  <UserAvatar name={m.name} color={m.color} photo={m.photo} size="sm" onClick={handleAvatarTap} />
                  {m.sickMode && (
                    <span className="absolute -top-0.5 -right-0.5 text-[10px]">🤒</span>
                  )}
                </div>
              ))}
              {family.members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-700 border-2 border-white flex items-center justify-center text-xs text-stone-500 font-medium">
                  +{family.members.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Tracker button */}
          <button onClick={() => setShowTracker(true)} className="text-lg" title="Family Tracker">🩺</button>

          {/* Theme button */}
          <button onClick={() => setShowTheme(true)} className="text-lg" title="Themes">🎨</button>

          {/* Settings gear — admin only */}
          <button
            onClick={() => requireAuth("settings", () => setShowManageFamily(true))}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
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
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="text-6xl">🏠</div>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Welcome to BoardRoom!</h2>
          <p className="text-stone-400 text-sm">Your family&apos;s digital sticky note board. Set up your family to get started.</p>
          <button
            onClick={() => router.push("/setup")}
            className="px-6 py-3 bg-amber-500 text-stone-900 rounded-xl font-medium hover:bg-amber-400 transition-colors text-sm"
          >
            Set Up Family →
          </button>
        </div>
      ) : family && (
        <NoteBoard
          notes={visibleNotes}
          members={family.members}
          currentUserId={currentUser?.id ?? ""}
          onNoteClick={(note) => setDetailNote(note)}
          onLike={(noteId, reactionType) => {
            setPendingLikeId(noteId);
            setPendingReactionType(reactionType || "heart");
            setPendingAction("like");
            setShowAuth(true);
          }}
          onNewNote={() => {
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
            {/* No device? Join here */}
            <div className="mt-4 pt-4 border-t border-stone-100 text-center">
              <p className="text-xs text-stone-400 mb-2">Don&apos;t have an account yet?</p>
              <button
                onClick={() => { setShowQuickPick(false); router.push("/join"); }}
                className="text-xs text-amber-500 hover:text-amber-400 font-medium py-1.5 px-4 rounded-lg hover:bg-amber-50 transition-colors"
              >
                Join this family board →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth — use AuthStack for like/comment (animated card stack), AuthPopup for others */}
      {showAuth && family && (pendingAction === "like" || pendingAction === "comment" ? (
        <AuthStack
          family={family}
          onAuth={handleAuth}
          onClose={() => { setShowAuth(false); setPendingAction(""); }}
          action={pendingAction === "like" ? "Who's reacting?" : "Who's commenting? 💬"}
          reactionType={pendingReactionType}
        />
      ) : (
        <AuthPopup
          family={family}
          onAuth={handleAuth}
          onClose={() => { setShowAuth(false); setPendingAction(""); }}
          action={pendingAction === "new-note" ? "Post a new note" : undefined}
        />
      ))}

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

      {/* Note detail — likes + comments */}
      {detailNote && family && (
        <NoteDetail
          note={detailNote}
          author={family.members.find(m => m.id === detailNote.authorId)}
          members={family.members}
          currentUser={currentUser}
          onLike={(noteId, reactionType) => {
            // Close detail first so auth renders on top, not behind sheet
            setDetailNote(null);
            setPendingLikeId(noteId);
            setPendingReactionType(reactionType || "heart");
            setPendingAction("like");
            setTimeout(() => setShowAuth(true), 50);
          }}
          onComment={(noteId, content) => {
            setDetailNote(null);
            setPendingCommentPayload({ noteId, content });
            setPendingAction("comment");
            setTimeout(() => setShowAuth(true), 50);
          }}
          onEdit={detailNote.authorId ? () => {
            setEditingNote(detailNote);
            setDetailNote(null);
            setShowNoteForm(true);
          } : undefined}
          onClose={() => setDetailNote(null)}
        />
      )}

      {/* Tracker panel */}
      {showTracker && family && (
        <TrackerPanel
          members={family.members}
          currentUser={currentUser}
          onUpdateMember={handleUpdateMember}
          onClose={() => setShowTracker(false)}
        />
      )}
    </div>
  );
}
