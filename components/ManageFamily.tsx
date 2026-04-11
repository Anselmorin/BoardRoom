"use client";

import { useState } from "react";
import { Family, FamilyMember, Role, ROLE_INFO, ALL_ROLES, ADMIN_ROLES } from "@/lib/types";

// Roles manageable from iPad: admins + children (no device). Others join via Remote app.
const IPAD_MANAGEABLE_ROLES: Role[] = [...ADMIN_ROLES, "baby", "toddler"];
import { MEMBER_COLORS } from "@/lib/colors";
import UserAvatar from "./UserAvatar";

const DURATION_OPTIONS = [
  { label: "4 hours", hours: 4 },
  { label: "8 hours", hours: 8 },
  { label: "12 hours", hours: 12 },
  { label: "24 hours", hours: 24 },
];

interface ManageFamilyProps {
  family: Family;
  onAddMember: (member: Omit<FamilyMember, "id">) => void;
  onClose: () => void;
}

export default function ManageFamily({
  family,
  onAddMember,
  onClose,
}: ManageFamilyProps) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<Role>("brother");
  const [expirationMode, setExpirationMode] = useState<"duration" | "custom">("duration");
  const [selectedDuration, setSelectedDuration] = useState(4);
  const [customExpiry, setCustomExpiry] = useState("");
  const [showForm, setShowForm] = useState(false);

  const usedColors = family.members.map((m) => m.color);
  const availableColors = MEMBER_COLORS.filter(
    (c) => !usedColors.includes(c.value)
  );
  const colorOptions = availableColors.length > 0 ? availableColors : MEMBER_COLORS;
  const [color, setColor] = useState(colorOptions[0].value);

  const isBabysitter = role === "babysitter";
  const roleInfo = ROLE_INFO[role];

  const handleAdd = () => {
    if (!name.trim() || pin.length !== 4) return;

    let expiresAt: string | undefined;
    if (isBabysitter) {
      if (expirationMode === "duration") {
        const d = new Date();
        d.setHours(d.getHours() + selectedDuration);
        expiresAt = d.toISOString();
      } else if (customExpiry) {
        expiresAt = new Date(customExpiry).toISOString();
      }
    }

    onAddMember({
      name: name.trim(),
      pin,
      color,
      role,
      isAdmin: ROLE_INFO[role].tier === "admin",
      ...(expiresAt ? { expiresAt } : {}),
    });
    setName("");
    setPin("");
    setRole("brother");
    setShowForm(false);
  };

  const formatExpiry = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }) + ", " + d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-stone-100 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">
            {family.name} Family Members
          </h2>

          {/* Current members list */}
          <div className="space-y-2 mb-4">
            {family.members.map((member) => {
              const info = member.role ? ROLE_INFO[member.role] : null;
              const isExpired = member.expiresAt && member.expiresAt < new Date().toISOString();
              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-2 rounded-lg bg-stone-200/30 ${isExpired ? "opacity-50" : ""}`}
                >
                  <UserAvatar
                    name={member.name}
                    color={member.color}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {info && <span className="text-sm">{info.emoji}</span>}
                      <span className="text-stone-800 text-sm">{member.name}</span>
                      {info && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          info.tier === "admin"
                            ? "text-amber-600 bg-amber-100"
                            : info.tier === "limited"
                            ? "text-stone-500 bg-stone-200"
                            : "text-emerald-600 bg-emerald-100"
                        }`}>
                          {info.label}
                        </span>
                      )}
                    </div>
                    {member.expiresAt && (
                      <p className={`text-xs mt-0.5 ${isExpired ? "text-red-400" : "text-stone-400"}`}>
                        {isExpired ? "Expired" : `Expires: ${formatExpiry(member.expiresAt)}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remote app note */}
          <div className="text-xs text-stone-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/50 rounded-lg px-3 py-2">
            📱 <strong>Brothers, sisters, au pairs, nannies</strong> should join via the <strong>BoardRoom Remote</strong> app using the family join code.
          </div>

          {/* Add member form (admin + children only) */}
          {showForm ? (
            <div className="space-y-3 p-3 rounded-lg bg-white/50 border border-stone-300/50">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="w-full p-2 rounded-lg bg-stone-100 border border-stone-300/50 text-stone-800 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                autoFocus
              />

              {/* Role picker */}
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block">
                  Role:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {IPAD_MANAGEABLE_ROLES.map((r) => {
                    const info = ROLE_INFO[r];
                    return (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`p-2 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                          role === r
                            ? "border-amber-500 bg-amber-100/50 scale-105"
                            : "border-stone-200 bg-white hover:border-amber-300"
                        }`}
                      >
                        <span className="text-lg">{info.emoji}</span>
                        <span className="text-[10px] font-medium text-stone-600 leading-tight">{info.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Babysitter expiration */}
              {isBabysitter && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/50">
                  <label className="text-xs text-amber-700 mb-1.5 block font-medium">
                    Access expires:
                  </label>
                  <div className="flex gap-1.5 mb-2">
                    <button
                      onClick={() => setExpirationMode("duration")}
                      className={`text-xs px-2 py-1 rounded-md ${
                        expirationMode === "duration"
                          ? "bg-amber-200 text-amber-800"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      Duration
                    </button>
                    <button
                      onClick={() => setExpirationMode("custom")}
                      className={`text-xs px-2 py-1 rounded-md ${
                        expirationMode === "custom"
                          ? "bg-amber-200 text-amber-800"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  {expirationMode === "duration" ? (
                    <div className="grid grid-cols-4 gap-1.5">
                      {DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.hours}
                          onClick={() => setSelectedDuration(opt.hours)}
                          className={`text-xs py-1.5 rounded-md transition-colors ${
                            selectedDuration === opt.hours
                              ? "bg-amber-500 text-white"
                              : "bg-white text-stone-600 hover:bg-amber-100"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="datetime-local"
                      value={customExpiry}
                      onChange={(e) => setCustomExpiry(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full p-1.5 text-sm rounded-md bg-white border border-stone-300/50 text-stone-800 focus:outline-none focus:border-amber-500/50"
                    />
                  )}
                </div>
              )}

              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPin(val);
                }}
                placeholder="4-digit PIN"
                inputMode="numeric"
                className="w-full p-2 rounded-lg bg-stone-100 border border-stone-300/50 text-stone-800 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              />
              <div>
                <label className="text-xs text-stone-400 mb-1.5 block">
                  Choose color:
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        color === c.value
                          ? "scale-125 ring-2 ring-white"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 text-sm text-stone-400 hover:bg-stone-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!name.trim() || pin.length !== 4}
                  className="flex-1 py-2 text-sm font-medium bg-amber-500 text-stone-900 rounded-lg hover:bg-amber-400 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-2 text-sm text-amber-400 hover:bg-amber-400/10 rounded-lg border border-dashed border-amber-500/30 transition-colors"
            >
              + Add Family Member
            </button>
          )}
        </div>

        <div className="p-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-400 hover:bg-stone-200 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
