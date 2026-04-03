export interface FamilyMember {
  id: string;
  name: string;
  pin: string;
  color: string;
  isAdmin: boolean;
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
}
