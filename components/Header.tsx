"use client";

import { FamilyMember, Family } from "@/lib/types";
import UserAvatar from "./UserAvatar";
import Clock from "./Clock";

interface HeaderProps {
  family: Family;
  currentUser: FamilyMember;
  onLogout: () => void;
  onManageFamily: () => void;
}

export default function Header({
  family,
  currentUser,
  onLogout,
  onManageFamily,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-stone-900/80 backdrop-blur-sm border-b border-stone-700/50">
      <div className="flex items-center gap-3">
        <div className="text-2xl">🏠</div>
        <div>
          <h1 className="text-xl font-bold text-amber-400">Fam Plan</h1>
          <p className="text-xs text-stone-400">{family.name} Family</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Clock />

        <div className="h-8 w-px bg-stone-700" />

        <div className="flex items-center gap-3">
          <UserAvatar name={currentUser.name} color={currentUser.color} />
          <div className="text-sm">
            <p className="text-stone-200 font-medium">{currentUser.name}</p>
            {currentUser.isAdmin && (
              <button
                onClick={onManageFamily}
                className="text-xs text-amber-500 hover:text-amber-400"
              >
                Manage Family
              </button>
            )}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="px-3 py-1.5 text-sm text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
