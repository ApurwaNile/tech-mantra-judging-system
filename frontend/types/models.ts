/**
 * Shared TypeScript types.
 *
 * Architecture note:
 * - These are simple app-level domain types (not generated DB types).
 * - Later you can replace/augment these with Supabase-generated types from your schema.
 */

export type UserRole = "ADMIN" | "JUDGE";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export type Event = {
  id: string;
  name: string;
  startsAt?: string; // ISO
  endsAt?: string; // ISO
};

export type Participant = {
  id: string;
  eventId: string;
  name: string;
};

export type Score = {
  id: string;
  eventId: string;
  participantId: string;
  judgeId: string;
  value: number;
  notes?: string;
};

