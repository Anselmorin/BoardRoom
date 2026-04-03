"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFamily, setFamily, setSession } from "@/lib/storage";
import { MEMBER_COLORS } from "@/lib/colors";
import { Role, ROLE_INFO, ADMIN_ROLES } from "@/lib/types";

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [role, setRole] = useState<Role>("dad");
  const [color, setColor] = useState(MEMBER_COLORS[0].value);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getFamily()) {
      router.replace("/");
      return;
    }
    setLoading(false);
  }, [router]);

  const handleComplete = () => {
    if (pin !== confirmPin) {
      setPinError("PINs don't match");
      return;
    }
    const memberId = crypto.randomUUID();
    setFamily({
      name: familyName.trim(),
      members: [
        {
          id: memberId,
          name: memberName.trim(),
          pin,
          color,
          role,
          isAdmin: true,
        },
      ],
    });
    setSession(memberId);
    router.push("/");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center animate-fade-in">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="animate-slide-up">
            <div className="text-5xl mb-4">🏠</div>
            <h1 className="text-3xl font-bold text-amber-400 mb-2">
              Welcome to BoardRoom!
            </h1>
            <p className="text-stone-400 mb-8">
              Let&apos;s set up your family board.
            </p>
            <button
              onClick={() => setStep(1)}
              className="px-8 py-3 bg-amber-500 text-stone-900 rounded-xl font-medium text-lg hover:bg-amber-400 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step 1: Family name */}
        {step === 1 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              What&apos;s your family name?
            </h2>
            <p className="text-stone-400 mb-6">
              This will show on your board.
            </p>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && familyName.trim()) setStep(2);
              }}
              placeholder="e.g. Smith"
              className="w-full p-4 text-center text-xl rounded-xl bg-stone-100 border border-stone-300 text-stone-800 placeholder-stone-500 focus:outline-none focus:border-amber-500 mb-4"
              autoFocus
            />
            <button
              onClick={() => setStep(2)}
              disabled={!familyName.trim()}
              className="w-full py-3 bg-amber-500 text-stone-900 rounded-xl font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Your name */}
        {step === 2 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              What&apos;s your name?
            </h2>
            <p className="text-stone-400 mb-6">
              You&apos;ll be the admin of the {familyName} family board.
            </p>
            <input
              type="text"
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && memberName.trim()) setStep(3);
              }}
              placeholder="Your name"
              className="w-full p-4 text-center text-xl rounded-xl bg-stone-100 border border-stone-300 text-stone-800 placeholder-stone-500 focus:outline-none focus:border-amber-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 text-stone-400 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!memberName.trim()}
                className="flex-1 py-3 bg-amber-500 text-stone-900 rounded-xl font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Choose role (admin roles only for setup) */}
        {step === 3 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              What&apos;s your role?
            </h2>
            <p className="text-stone-400 mb-6">
              As the first member, you&apos;ll be an admin.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ADMIN_ROLES.map((r) => {
                const info = ROLE_INFO[r];
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      role === r
                        ? "border-amber-500 bg-amber-100/50 scale-105"
                        : "border-stone-200 bg-white hover:border-amber-300 hover:bg-amber-50/30"
                    }`}
                  >
                    <span className="text-3xl">{info.emoji}</span>
                    <span className="text-sm font-medium text-stone-700">{info.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 text-stone-400 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 bg-amber-500 text-stone-900 rounded-xl font-medium hover:bg-amber-400 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Choose color */}
        {step === 4 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Pick your color
            </h2>
            <p className="text-stone-400 mb-6">
              This will identify your notes on the board.
            </p>
            <div className="flex gap-3 justify-center flex-wrap mb-6">
              {MEMBER_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-12 h-12 rounded-full transition-all ${
                    color === c.value
                      ? "scale-125 ring-4 ring-white/30"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
            <div
              className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
              style={{ backgroundColor: color }}
            >
              {memberName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 text-stone-400 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-3 bg-amber-500 text-stone-900 rounded-xl font-medium hover:bg-amber-400 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Set PIN */}
        {step === 5 && (
          <div className="animate-slide-up">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              Set a 4-digit PIN
            </h2>
            <p className="text-stone-400 mb-6">
              You&apos;ll use this to log in.
            </p>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(val);
                setPinError("");
              }}
              placeholder="PIN"
              inputMode="numeric"
              className="w-full p-4 text-center text-2xl tracking-[0.5em] rounded-xl bg-stone-100 border border-stone-300 text-stone-800 placeholder-stone-500 focus:outline-none focus:border-amber-500 mb-3"
              autoFocus
            />
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                setConfirmPin(val);
                setPinError("");
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  pin.length === 4 &&
                  confirmPin.length === 4
                )
                  handleComplete();
              }}
              placeholder="Confirm PIN"
              inputMode="numeric"
              className="w-full p-4 text-center text-2xl tracking-[0.5em] rounded-xl bg-stone-100 border border-stone-300 text-stone-800 placeholder-stone-500 focus:outline-none focus:border-amber-500 mb-3"
            />
            {pinError && (
              <p className="text-red-400 text-sm mb-3">{pinError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-3 text-stone-400 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={pin.length !== 4 || confirmPin.length !== 4}
                className="flex-1 py-3 bg-amber-500 text-stone-900 rounded-xl font-medium hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                Create Board
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-amber-400" : "bg-stone-200"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
