"use client";

import { useState, useRef } from "react";
import { FamilyMember, Note, ROLE_INFO } from "@/lib/types";
import UserAvatar from "./UserAvatar";

interface AccountPageProps {
  member: FamilyMember;
  privateNotes: Note[];
  allMembers: FamilyMember[];
  onUpdatePhoto: (memberId: string, photo: string) => void;
  onChangePin: (memberId: string, newPin: string) => void;
  onClose: () => void;
}

export default function AccountPage({
  member,
  privateNotes,
  allMembers,
  onUpdatePhoto,
  onChangePin,
  onClose,
}: AccountPageProps) {
  const [tab, setTab] = useState<"profile" | "messages">("profile");
  const [changingPin, setChangingPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roleInfo = ROLE_INFO[member.role];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onUpdatePhoto(member.id, result);
    };
    reader.readAsDataURL(file);
  };

  const handlePinSave = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinError("PIN must be 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      setPinError("PINs don't match");
      return;
    }
    onChangePin(member.id, newPin);
    setPinSuccess(true);
    setPinError("");
    setNewPin("");
    setConfirmPin("");
    setTimeout(() => {
      setChangingPin(false);
      setPinSuccess(false);
    }, 1500);
  };

  const getSender = (note: Note) =>
    allMembers.find((m) => m.id === note.authorId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 dark:border-stone-700 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-6 pb-4"
          style={{ backgroundColor: member.color + "15" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar / photo */}
              <div className="relative">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover border-2"
                    style={{ borderColor: member.color }}
                  />
                ) : (
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-white dark:bg-stone-700 rounded-full border border-stone-200 dark:border-stone-600 flex items-center justify-center text-xs shadow hover:scale-110 transition-transform"
                  title="Change photo"
                >
                  📷
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
                  {member.name}
                </h2>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {roleInfo.emoji} {roleInfo.label}
                </p>
                <div
                  className="mt-1 w-4 h-1 rounded-full"
                  style={{ backgroundColor: member.color }}
                />
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setTab("profile")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === "profile"
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              }`}
              style={
                tab === "profile"
                  ? { backgroundColor: member.color + "30", color: member.color }
                  : undefined
              }
            >
              Profile
            </button>
            <button
              onClick={() => setTab("messages")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === "messages"
                  ? "text-stone-900"
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              }`}
              style={
                tab === "messages"
                  ? { backgroundColor: member.color + "30", color: member.color }
                  : undefined
              }
            >
              🔒 Private Messages
              {privateNotes.length > 0 && (
                <span
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: member.color }}
                >
                  {privateNotes.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 max-h-96 overflow-y-auto">
          {tab === "profile" && (
            <div className="space-y-5">
              {/* Color swatch */}
              <div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mb-2 font-medium uppercase tracking-wide">
                  Your Color
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="text-sm text-stone-500 dark:text-stone-400 font-mono">
                    {member.color}
                  </span>
                </div>
              </div>

              {/* Change PIN */}
              <div>
                <p className="text-xs text-stone-400 dark:text-stone-500 mb-2 font-medium uppercase tracking-wide">
                  PIN
                </p>
                {!changingPin ? (
                  <button
                    onClick={() => setChangingPin(true)}
                    className="px-4 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                  >
                    Change PIN
                  </button>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="New PIN (4 digits)"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="Confirm PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm focus:outline-none focus:border-amber-400"
                    />
                    {pinError && (
                      <p className="text-xs text-red-400">{pinError}</p>
                    )}
                    {pinSuccess && (
                      <p className="text-xs text-green-500">✓ PIN updated!</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handlePinSave}
                        className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-stone-900 font-medium hover:bg-amber-400 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setChangingPin(false);
                          setNewPin("");
                          setConfirmPin("");
                          setPinError("");
                        }}
                        className="px-4 py-2 text-sm rounded-lg border border-stone-200 dark:border-stone-600 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "messages" && (
            <div>
              {privateNotes.length === 0 ? (
                <div className="text-center py-8 text-stone-400 dark:text-stone-500">
                  <div className="text-3xl mb-2">🔒</div>
                  <p className="text-sm">No private messages yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {privateNotes.map((note) => {
                    const sender = getSender(note);
                    return (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-700"
                      >
                        <p className="text-stone-800 dark:text-stone-200 text-sm leading-relaxed">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          {sender && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: sender.color }}
                            />
                          )}
                          <span className="text-xs text-stone-400">
                            From {sender?.name || "Unknown"} ·{" "}
                            {new Date(note.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
