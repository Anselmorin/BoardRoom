"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getFamily, setFamily as saveFamily } from "@/lib/storage";
import { FamilyMember, Role, ROLE_INFO } from "@/lib/types";
import { MEMBER_COLORS } from "@/lib/colors";

const JOINABLE_ROLES: Role[] = ["brother", "sister", "chef", "nanny", "au-pair", "babysitter"];

export default function JoinPage() {
  const router = useRouter();
  const family = getFamily();

  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("brother");
  const [color, setColor] = useState(MEMBER_COLORS[0].value);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");

  const handleJoin = () => {
    if (pin !== confirmPin) { setPinError("PINs don't match"); return; }
    if (pin.length !== 4) { setPinError("PIN must be 4 digits"); return; }
    if (!family) return;

    const newMember: FamilyMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      pin,
      color,
      role,
      isAdmin: false,
    };

    const updated = { ...family, members: [...family.members, newMember] };
    saveFamily(updated);
    router.replace("/");
  };

  if (!family) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl mb-2">🏠</p>
          <p className="text-stone-600">No family board set up on this device.</p>
          <button onClick={() => router.replace("/")} className="mt-4 text-amber-500 text-sm">← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {(
          <>
            <h1 className="text-xl font-bold text-stone-800 mb-1">Create your account</h1>
            <p className="text-sm text-stone-400 mb-5">Welcome to {family.name} Family!</p>

            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1 block">Your name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-amber-400 mb-4"
            />

            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 block">Role</label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {JOINABLE_ROLES.map(r => {
                const info = ROLE_INFO[r];
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${role === r ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-amber-300"}`}
                  >
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-xs font-medium text-stone-600">{info.label}</span>
                  </button>
                );
              })}
            </div>

            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {MEMBER_COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c.value ? "ring-2 ring-offset-2 ring-amber-500 scale-110" : ""}`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>

            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1 block">4-digit PIN</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-stone-800 focus:outline-none focus:border-amber-400 mb-3"
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="Confirm PIN"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-stone-800 focus:outline-none focus:border-amber-400 mb-2"
            />
            {pinError && <p className="text-xs text-red-400 mb-3">{pinError}</p>}

            <button
              onClick={handleJoin}
              disabled={!name.trim() || pin.length < 4}
              className="w-full py-3 bg-amber-500 text-stone-900 rounded-xl font-bold hover:bg-amber-400 transition-colors disabled:opacity-40 mt-2"
            >
              Join {family.name} Family 🏠
            </button>
          </>
        )}
      </div>
    </div>
  );
}
