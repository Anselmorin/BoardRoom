"use client";

import { useState } from "react";
import { Family, FamilyMember } from "@/lib/types";
import { PixelReactionAnimated } from "./PixelHeart";
import UserAvatar from "./UserAvatar";

interface AuthPopupProps {
  family: Family;
  onAuth: (user: FamilyMember) => void;
  onClose: () => void;
  action?: string;
}

export default function AuthPopup({ family, onAuth, onClose, action }: AuthPopupProps) {
  const [step, setStep] = useState<"pick" | "pin" | "success">("pick");
  const [selected, setSelected] = useState<FamilyMember | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handlePickMember = (member: FamilyMember) => {
    setSelected(member);
    setPin("");
    setError("");
    setStep("pin");
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      setTimeout(() => {
        if (selected && newPin === selected.pin) {
          setStep("success");
          setTimeout(() => onAuth(selected), 700);
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
      <div className="w-full max-w-sm mb-6" onClick={e => e.stopPropagation()}>
        <div className="bg-white dark:bg-stone-800 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">

          {/* Step 1: Pick member */}
          {step === "pick" && (
            <div className="p-6 animate-fade-in">
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 text-center">
                {action || "Who are you?"}
              </p>
              <h2 className="text-lg font-bold text-stone-800 dark:text-stone-100 text-center mb-5">
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
          )}

          {/* Step 2: PIN */}
          {step === "pin" && selected && (
            <div className="p-6 animate-fade-in">
              <button
                onClick={() => { setStep("pick"); setPin(""); setError(""); }}
                className="text-xs text-stone-400 mb-4 flex items-center gap-1 hover:text-stone-600"
              >
                ← Back
              </button>

              <div className="flex flex-col items-center gap-3 mb-6">
                <UserAvatar name={selected.name} color={selected.color} photo={selected.photo} size="lg" />
                <p className="font-bold text-stone-800 dark:text-stone-100">{selected.name}</p>
                {error && <p className="text-xs text-red-400">{error}</p>}
              </div>

              {/* PIN dots */}
              <div className={`flex justify-center gap-4 mb-6 ${shaking ? "animate-bounce" : ""}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full transition-all duration-150"
                    style={{
                      backgroundColor: pin.length > i ? selected.color : undefined,
                      border: `2px solid ${pin.length > i ? selected.color : "#d6d3d1"}`,
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

          {/* Step 3: Success */}
          {step === "success" && selected && (
            <div
              className="p-8 flex flex-col items-center justify-center gap-3 animate-pop"
              style={{ background: selected.color + "15", minHeight: "220px" }}
            >
              <PixelReactionAnimated type="heart" color={selected.color} size={48} />
              <p className="font-bold text-lg" style={{ color: selected.color }}>
                Hey {selected.name}!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
