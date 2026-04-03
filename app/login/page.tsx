"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Family, FamilyMember } from "@/lib/types";
import { getFamily, getSession, setSession } from "@/lib/storage";
import UserAvatar from "@/components/UserAvatar";

export default function LoginPage() {
  const router = useRouter();
  const [family, setFamily] = useState<Family | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fam = getFamily();
    if (!fam) {
      router.replace("/setup");
      return;
    }

    const session = getSession();
    if (session && fam.members.find((m) => m.id === session)) {
      router.replace("/");
      return;
    }

    setFamily(fam);
    setLoading(false);
  }, [router]);

  const handleDigit = (digit: number) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError("");

    if (newPin.length === 4 && selectedMember) {
      if (newPin === selectedMember.pin) {
        setSession(selectedMember.id);
        router.push("/");
      } else {
        setError("Wrong PIN");
        setTimeout(() => setPin(""), 300);
      }
    }
  };

  const handleDelete = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  if (loading || !family) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="text-amber-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="text-4xl mb-2">🏠</div>
        <h1 className="text-3xl font-bold text-amber-400 mb-1">Fam Plan</h1>
        <p className="text-stone-400 mb-8">{family.name} Family</p>

        {!selectedMember ? (
          <div>
            <p className="text-stone-300 mb-6">Who are you?</p>
            <div className="flex gap-4 justify-center flex-wrap">
              {family.members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-stone-800/50 transition-colors"
                >
                  <UserAvatar
                    name={member.name}
                    color={member.color}
                    size="lg"
                  />
                  <span className="text-stone-200 text-sm">{member.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-slide-up">
            <div className="flex justify-center mb-3">
              <UserAvatar
                name={selectedMember.name}
                color={selectedMember.color}
                size="lg"
              />
            </div>
            <p className="text-stone-200 mb-6">{selectedMember.name}</p>

            {/* PIN display */}
            <div className="flex gap-2 justify-center mb-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
                    pin.length > i
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-stone-600 bg-stone-800/50 text-stone-600"
                  }`}
                >
                  {pin.length > i ? "•" : ""}
                </div>
              ))}
            </div>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleDigit(num)}
                  className="w-16 h-16 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xl font-medium transition-colors flex items-center justify-center"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleDigit(0)}
                className="w-16 h-16 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xl font-medium transition-colors flex items-center justify-center"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="w-16 h-16 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xl font-medium transition-colors flex items-center justify-center"
              >
                ←
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedMember(null);
                setPin("");
                setError("");
              }}
              className="mt-6 text-sm text-stone-400 hover:text-stone-300"
            >
              ← Pick someone else
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
