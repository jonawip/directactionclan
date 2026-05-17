import type { Tables } from "@/types/db";

export type GameStatus = "open" | "full" | "cancelled" | "completed";

export type GameRow = Tables<"games">;
export type ProfileRow = Tables<"profiles">;
export type RsvpRow = Tables<"rsvps">;

export type RsvpWithProfile = RsvpRow & {
  profiles: Pick<ProfileRow, "id" | "display_name" | "handle" | "avatar_url">;
};

export type GameWithRsvps = GameRow & {
  rsvps: RsvpWithProfile[];
  creator: Pick<ProfileRow, "id" | "display_name" | "handle" | "avatar_url">;
};

export type WebhookEvent =
  | "game.created"
  | "game.full"
  | "game.cancelled"
  | "game.starting";

export type AccentColour = "acid" | "pink" | "cyan";
