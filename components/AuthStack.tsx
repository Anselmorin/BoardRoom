"use client";

import { useState } from "react";
import { Family, FamilyMember } from "@/lib/types";
import UserAvatar from "./UserAvatar";

interface AuthStackProps {
  family: Family;
  onAuth: (member: FamilyMember) => void;
  onClose: () => void;
  action?: string;
}

type AuthStep = "pick" | "pin" | "success";

export default function AuthStack({ family, onAuth, onClose, action }: AuthStackProps) {
  const [step, setStep] = useState<AuthStep>("pick");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handlePickMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setPin("");
    setError("");
    setStep("pin");
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      // Check PIN
      setTimeout(() => {
        if (selectedMember && newPin === selectedMember.pin) {
          setStep("success");
          setTimeout(() => {
            onAuth(selectedMember);
          }, 800);
        } else {
          setShaking(true);
          setTimeout(() => {
            setShaking(false);
            setPin("");
            setError("Wrong PIN, try again");
          }, 500);
        }
      }, 100);
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      {/* Card stack */}
      <div className="relative w-full max-w-sm mb-6" onClick={e => e.stopPropagation()}>

        {/* Card 1 — Pick member (always rendered as base) */}
        <div
          className="absolute inset-0 bg-white dark:bg-stone-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-700 transition-all duration-300"
          style={{
            transform: step === "pick" ? "translateX(0) rotate(0deg)" : "translateX(-12px) rotate(-2deg) scale(0.97)",
            zIndex: 1,
          }}
        >
          <div className="p-6">
            <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 text-center">
              {action || "Who are you?"}
            </p>
            <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 text-center mb-4">
              Pick your name
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {family.members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handlePickMember(m)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <UserAvatar name={m.name} color={m.color} photo={m.photo} size="md" />
                  <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">{m.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2 — PIN entry (slides in on top) */}
        <div
          className="relative bg-white dark:bg-stone-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-700 transition-all duration-400"
          style={{
            transform: step === "pick"
              ? "translateX(100%) rotate(4deg)"
              : step === "pin"
              ? "translateX(0) rotate(0deg)"
              : "translateX(-100%) rotate(-4deg)",
            opacity: step === "pick" ? 0 : 1,
            zIndex: 2,
            minHeight: "320px",
          }}
        >
          {selectedMember && (
            <div className="p-6">
              <button
                onClick={() => { setStep("pick"); setPin(""); setError(""); }}
                className="text-xs text-stone-400 mb-4 flex items-center gap-1 hover:text-stone-600"
              >
                ← Back
              </button>

              <div className="flex flex-col items-center gap-3 mb-6">
                <UserAvatar name={selectedMember.name} color={selectedMember.color} photo={selectedMember.photo} size="lg" />
                <p className="font-bold text-stone-800 dark:text-stone-100">{selectedMember.name}</p>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              {/* PIN dots */}
              <div
                className={`flex justify-center gap-4 mb-6 ${shaking ? "animate-bounce" : ""}`}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full transition-all duration-150"
                    style={{
                      backgroundColor: pin.length > i ? selectedMember.color : undefined,
                      border: `2px solid ${pin.length > i ? selectedMember.color : "#d6d3d1"}`,
                      transform: pin.length > i ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2">
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => digit === "⌫" ? handleDelete() : digit ? handlePinDigit(digit) : null}
                    disabled={!digit}
                    className={`h-14 rounded-2xl text-lg font-semibold transition-all active:scale-95 ${
                      digit === "⌫"
                        ? "text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
                        : digit
                        ? "bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-600"
                        : "invisible"
                    }`}
                  >
                    {digit}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 3 — Success */}
        {step === "success" && selectedMember && (
          <div
            className="absolute inset-0 rounded-3xl flex flex-col items-center justify-center gap-3 animate-pop"
            style={{
              background: selectedMember.color + "15",
              border: `2px solid ${selectedMember.color}40`,
              zIndex: 3,
              minHeight: "320px",
            }}
          >
            <div className="text-5xl animate-bounce">❤️</div>
            <p className="font-bold text-lg" style={{ color: selectedMember.color }}>
              Hey {selectedMember.name}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
