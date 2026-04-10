export type Role = "dad" | "mom" | "brother" | "sister" | "chef" | "nanny" | "au-pair" | "babysitter";

export const ROLE_INFO: Record<Role, { label: string; emoji: string; tier: "admin" | "member" | "limited" }> = {
  dad: { label: "Dad", emoji: "👨", tier: "admin" },
  mom: { label: "Mom", emoji: "👩", tier: "admin" },
  brother: { label: "Brother", emoji: "👦", tier: "member" },
  sister: { label: "Sister", emoji: "👧", tier: "member" },
  chef: { label: "Chef", emoji: "🧑‍🍳", tier: "member" },
  nanny: { label: "Nanny", emoji: "👶", tier: "member" },
  "au-pair": { label: "Au Pair", emoji: "🏠", tier: "member" },
  babysitter: { label: "Babysitter", emoji: "🍼", tier: "limited" },
};

export const ALL_ROLES = Object.keys(ROLE_INFO) as Role[];
export const ADMIN_ROLES = ALL_ROLES.filter((r) => ROLE_INFO[r].tier === "admin");

export interface FamilyMember {
  id: string;
  name: string;
  pin: string;
  color: string;
  role: Role;
  isAdmin: boolean; // keep for backward compat, derived from role tier
  expiresAt?: string; // ISO date string, only for babysitter
  photo?: string; // base64 data URL
}

/** Backward compat: assign a role to legacy members that don't have one */
export function ensureRole(member: FamilyMember): FamilyMember {
  if (member.role && ROLE_INFO[member.role]) return member;
  return {
    ...member,
    role: member.isAdmin ? "dad" : "brother",
  };
}

export interface Family {
  name: string;
  members: FamilyMember[];
}

export interface Note {
  id: string;
  authorId: string;
  content: string;
  type: "sticky" | "reminder";
  visibility: "public" | "private";
  recipientId?: string;
  recipientIds?: string[];
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteInput {
  id?: string;
  content: string;
  type: "sticky" | "reminder";
  visibility: "public" | "private";
  recipientId?: string;
  recipientIds?: string[];
}
