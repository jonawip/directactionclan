import { addDays, addMinutes, isAfter, isBefore } from "date-fns";
import { z } from "zod";
import { findActivity } from "@/lib/games/catalogue";
import type { GameRow } from "@/types/domain";

const MIN_LEAD_MINUTES = 15;
const MAX_LOOKAHEAD_DAYS = 30;
const MIN_DURATION = 15;
const MAX_DURATION = 480;
const RSVP_CUTOFF_MINUTES = 5;

export const createGameSchema = z.object({
  gameSlug: z.string().min(1),
  activitySlug: z.string().min(1),
  title: z.string().trim().min(1).max(80),
  description: z.string().max(2000).optional().nullable(),
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(MIN_DURATION).max(MAX_DURATION),
  maxPlayers: z.number().int().min(1),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;

export function validateCreateGame(input: CreateGameInput): string | null {
  const activity = findActivity(input.gameSlug, input.activitySlug);
  if (!activity) {
    return "Unknown game or activity.";
  }

  const startsAt = new Date(input.startsAt);
  const now = new Date();
  const earliest = addMinutes(now, MIN_LEAD_MINUTES);
  const latest = addDays(now, MAX_LOOKAHEAD_DAYS);

  if (isBefore(startsAt, earliest)) {
    return `Start time must be at least ${MIN_LEAD_MINUTES} minutes from now.`;
  }
  if (isAfter(startsAt, latest)) {
    return `Start time cannot be more than ${MAX_LOOKAHEAD_DAYS} days ahead.`;
  }
  if (input.maxPlayers > activity.defaultMaxPlayers) {
    return `Max players cannot exceed ${activity.defaultMaxPlayers} for this activity.`;
  }

  return null;
}

export function canJoinGame(game: GameRow, now = new Date()): string | null {
  if (game.status === "cancelled" || game.status === "completed") {
    return "This game is no longer accepting players.";
  }
  if (game.status === "full") {
    return "This game is full.";
  }
  const startsAt = new Date(game.starts_at);
  const cutoff = addMinutes(startsAt, -RSVP_CUTOFF_MINUTES);
  if (isAfter(now, cutoff)) {
    return "RSVP closed — less than 5 minutes until start.";
  }
  return null;
}

export function canLeaveGame(game: GameRow, now = new Date()): string | null {
  const startsAt = new Date(game.starts_at);
  if (!isBefore(now, startsAt)) {
    return "Cannot leave after the game has started.";
  }
  return null;
}

export function gameEndTime(game: GameRow): Date {
  return addMinutes(new Date(game.starts_at), game.duration_minutes);
}

export function gamesOverlap(a: GameRow, b: GameRow): boolean {
  const aStart = new Date(a.starts_at);
  const aEnd = gameEndTime(a);
  const bStart = new Date(b.starts_at);
  const bEnd = gameEndTime(b);
  return aStart < bEnd && bStart < aEnd;
}

export const updateGameSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  description: z.string().max(2000).optional().nullable(),
  startsAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(MIN_DURATION).max(MAX_DURATION).optional(),
  maxPlayers: z.number().int().min(1).optional(),
});
