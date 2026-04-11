export type Role = "dad" | "mom" | "brother" | "sister" | "chef" | "nanny" | "au-pair" | "babysitter" | "baby" | "toddler";

export const ROLE_INFO: Record<Role, { label: string; emoji: string; tier: "admin" | "member" | "limited" | "child" }> = {
  dad: { label: "Dad", emoji: "👨", tier: "admin" },
  mom: { label: "Mom", emoji: "👩", tier: "admin" },
  brother: { label: "Brother", emoji: "👦", tier: "member" },
  sister: { label: "Sister", emoji: "👧", tier: "member" },
  chef: { label: "Chef", emoji: "🧑‍🍳", tier: "member" },
  nanny: { label: "Nanny", emoji: "👶", tier: "member" },
  "au-pair": { label: "Au Pair", emoji: "🏠", tier: "member" },
  babysitter: { label: "Babysitter", emoji: "🍼", tier: "limited" },
  baby: { label: "Baby", emoji: "👶", tier: "child" },
  toddler: { label: "Toddler", emoji: "🧒", tier: "child" },
};

export const ALL_ROLES = Object.keys(ROLE_INFO) as Role[];
export const ADMIN_ROLES = ALL_ROLES.filter((r) => ROLE_INFO[r].tier === "admin");

export interface MedLog {
  id: string;
  medication: string;
  dose: string;
  givenAt: string;      // ISO date
  givenById: string;    // member who gave it
  frequencyHours?: number; // repeat every X hours (null = one-time)
}

export interface ActivityLog {
  id: string;
  type: "fed" | "mood" | "note" | "diaper" | "sleep";
  value?: string;       // mood emoji, note text, etc
  loggedAt: string;
  loggedById: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  pin: string;
  color: string;
  role: Role;
  isAdmin: boolean; // keep for backward compat, derived from role tier
  expiresAt?: string; // ISO date string, only for babysitter
  photo?: string; // base64 data URL
  // Health tracking
  sickMode?: boolean;
  medLogs?: MedLog[];
  activityLogs?: ActivityLog[];
  // Young child tracking (Lumi etc)
  isYoungChild?: boolean; // enables feeding/activity log
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

export interface Comment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export type ReactionType = "heart" | "thumbsup";

export interface Reaction {
  memberId: string;
  type: ReactionType;
}

export type RepeatRule = "none" | "hourly" | "every2h" | "every4h" | "every6h" | "every8h" | "every12h" | "daily" | "weekly";

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
  likes?: string[]; // legacy - kept for backward compat
  reactions?: Reaction[];
  comments?: Comment[];
  // Reminder fields
  dueAt?: string;         // ISO date for timed reminders
  repeatRule?: RepeatRule; // repeating reminders
  lastTriggered?: string;  // last time reminder fired
  completedAt?: string;    // for one-off reminders
}

export interface NoteInput {
  id?: string;
  content: string;
  type: "sticky" | "reminder";
  visibility: "public" | "private";
  recipientId?: string;
  recipientIds?: string[];
  dueAt?: string;
  repeatRule?: RepeatRule;
}
