"use client";

import { useState } from "react";
import { Family, FamilyMember } from "@/lib/types";
import { MEMBER_COLORS } from "@/lib/colors";
import UserAvatar from "./UserAvatar";

interface ManageFamilyProps {
  family: Family;
  onAddMember: (member: Omit<FamilyMember, "id" | "isAdmin">) => void;
  onClose: () => void;
}

export default function ManageFamily({
  family,
  onAddMember,
  onClose,
}: ManageFamilyProps) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showForm, setShowForm] = useState(false);

  const usedColors = family.members.map((m) => m.color);
  const availableColors = MEMBER_COLORS.filter(
    (c) => !usedColors.includes(c.value)
  );
  const colorOptions = availableColors.length > 0 ? availableColors : MEMBER_COLORS;
  const [color, setColor] = useState(colorOptions[0].value);

  const handleAdd = () => {
    if (name.trim() && pin.length === 4) {
      onAddMember({ name: name.trim(), pin, color });
      setName("");
      setPin("");
      setShowForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-stone-100 rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 animate-slide-up">
        <div className="p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-4">
            {family.name} Family Members
          </h2>

          {/* Current members list */}
          <div className="space-y-2 mb-4">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-stone-200/30"
              >
                <UserAvatar
                  name={member.name}
                  color={member.color}
                  size="sm"
                />
                <span className="text-stone-800 text-sm">{member.name}</span>
                {member.isAdmin && (
                  <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Add member form */}
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
