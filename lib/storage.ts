import { Family, Note } from "./types";

const FAMILY_KEY = "famplan_family";
const NOTES_KEY = "famplan_notes";
const SESSION_KEY = "famplan_session";

export function getFamily(): Family | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(FAMILY_KEY);
  return data ? JSON.parse(data) : null;
}

export function setFamily(family: Family): void {
  localStorage.setItem(FAMILY_KEY, JSON.stringify(family));
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
