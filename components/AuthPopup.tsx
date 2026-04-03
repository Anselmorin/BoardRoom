"use client";

import { useState } from "react";
import { Family, FamilyMember } from "@/lib/types";
import UserAvatar from "./UserAvatar";

interface AuthPopupProps {
  family: Family;
  onAuth: (user: FamilyMember) => void;
  onClose: () => void;
  action?: string;
}

export default function AuthPopup({ family, onAuth, onClose, action }: AuthPopupProps) {
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!selected) return;
    if (selected.pin === pin) {
      onAuth(selected);
    } else {
      setError("Wrong PIN");
      setPin("");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        {!selected ? (
          <>
            <h2 className="text-lg font-bold text-stone-800 mb-1 text-center">Who are you?</h2>
            {action && <p className="text-xs text-stone-400 mb-4 text-center">{action}</p>}
            <div className="grid grid-cols-3 gap-3">
              {family.members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setSelected(m); setPin(""); setError(""); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-amber-50 transition-colors"
                >
                  <UserAvatar name={m.name} color={m.color} size="lg" />
                  <span className="text-xs text-stone-600">{m.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center mb-4">
              <UserAvatar name={selected.name} color={selected.color} size="lg" />
              <p className="text-sm font-medium text-stone-800 mt-2">{selected.name}</p>
            </div>
            <label className="text-xs font-semibold text-stone-400 mb-2 block text-center">ENTER PIN</label>
            <input
              value={pin}
              onChange={(e) => { if (/^\d{0,4}$/.test(e.target.value)) { setPin(e.target.value); setError(""); } }}
              type="password"
              maxLength={4}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-4 py-3 outline-none mb-2 text-center text-2xl tracking-[0.5em] text-stone-800 focus:border-amber-400"
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter" && pin.length === 4) handleSubmit(); }}
            />
            {error && <p className="text-xs text-red-500 text-center mb-2">{error}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setSelected(null); setPin(""); setError(""); }} className="px-4 py-2.5 rounded-lg bg-stone-100 text-stone-500 text-sm">Back</button>
              <button
                onClick={handleSubmit}
                disabled={pin.length !== 4}
                className="flex-1 py-2.5 rounded-lg bg-amber-500 text-white font-bold text-sm disabled:opacity-40"
              >Confirm</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
