import { Family, FamilyMember, Note, ensureRole } from "./types";

const FAMILY_KEY = "famplan_family";
const NOTES_KEY = "famplan_notes";
const SESSION_KEY = "famplan_session";

/** Remove expired babysitters from the family */
function cleanExpiredMembers(family: Family): Family {
  const now = new Date().toISOString();
  const cleaned = family.members.filter((m) => {
    if (m.expiresAt && m.expiresAt < now) return false;
    return true;
  });
  if (cleaned.length !== family.members.length) {
    const updated = { ...family, members: cleaned };
    localStorage.setItem(FAMILY_KEY, JSON.stringify(updated));
    return updated;
  }
  return family;
}

export function getFamily(): Family | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(FAMILY_KEY);
  if (!data) return null;
  let family: Family = JSON.parse(data);
  // Backward compat: ensure all members have a role
  family = {
    ...family,
    members: family.members.map(ensureRole),
  };
  // Clean expired babysitters
  family = cleanExpiredMembers(family);
  return family;
}

function generateJoinCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const p1 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${p1}-${p2}`;
}

export function setFamily(family: Family): void {
  // Auto-generate join code if not present
  if (!family.joinCode) {
    family = { ...family, joinCode: generateJoinCode() };
  }
  localStorage.setItem(FAMILY_KEY, JSON.stringify(family));
}

/** Get a member by ID, returning null if not found or expired */
export function getActiveMember(id: string): FamilyMember | null {
  const family = getFamily();
  if (!family) return null;
  const member = family.members.find((m) => m.id === id);
  if (!member) return null;
  if (member.expiresAt && member.expiresAt < new Date().toISOString()) return null;
  return member;
}

export function getNotes(): Note[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(NOTES_KEY);
  return data ? JSON.parse(data) : [];
}

export function setNotes(notes: Note[]): void {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
