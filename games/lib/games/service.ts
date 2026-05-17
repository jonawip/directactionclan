import { revalidatePath } from "next/cache";
import { dispatchGameWebhook } from "@/lib/discord/webhook";
import {
  canJoinGame,
  canLeaveGame,
  createGameSchema,
  updateGameSchema,
  validateCreateGame,
  validateUpdateGame,
  type CreateGameInput,
  type UpdateGameInput,
} from "@/lib/games/rules";
import { findActivity } from "@/lib/games/catalogue";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";
import type { GameRow } from "@/types/domain";

type Client = SupabaseClient<Database>;

export async function createGame(
  supabase: Client,
  userId: string,
  raw: CreateGameInput,
): Promise<{ game?: GameRow; error?: string }> {
  const parsed = createGameSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const input = parsed.data;
  const ruleError = validateCreateGame(input);
  if (ruleError) {
    return { error: ruleError };
  }

  const activity = findActivity(input.gameSlug, input.activitySlug);
  if (!activity) {
    return { error: "Unknown activity." };
  }

  const { data: game, error } = await supabase
    .from("games")
    .insert({
      game_slug: input.gameSlug,
      activity_slug: input.activitySlug,
      title: input.title,
      description: input.description ?? null,
      starts_at: input.startsAt,
      duration_minutes: input.durationMinutes,
      max_players: input.maxPlayers,
      created_by: userId,
    })
    .select()
    .single();

  if (error || !game) {
    return { error: error?.message ?? "Failed to create game" };
  }

  const { error: rsvpError } = await supabase.from("rsvps").insert({
    game_id: game.id,
    user_id: userId,
  });

  if (rsvpError) {
    return { error: rsvpError.message };
  }

  const { data: host } = await supabase
    .from("profiles")
    .select("display_name, handle")
    .eq("id", userId)
    .single();

  if (host) {
    await dispatchGameWebhook("game.created", game, host, {
      openSlots: game.max_players - 1,
    });
  }

  revalidatePath("/");
  return { game };
}

export async function joinGame(
  supabase: Client,
  userId: string,
  gameId: string,
): Promise<{ error?: string }> {
  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (!game) {
    return { error: "Game not found" };
  }

  const joinError = canJoinGame(game);
  if (joinError) {
    return { error: joinError };
  }

  const { count } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId);

  if ((count ?? 0) >= game.max_players) {
    return { error: "This game is full." };
  }

  const { error } = await supabase.from("rsvps").insert({
    game_id: gameId,
    user_id: userId,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: updated } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (updated?.status === "full") {
    const { data: host } = await supabase
      .from("profiles")
      .select("display_name, handle")
      .eq("id", updated.created_by)
      .single();
    if (host) {
      await dispatchGameWebhook("game.full", updated, host);
    }
  }

  revalidatePath("/");
  revalidatePath(`/games/${gameId}`);
  return {};
}

export async function leaveGame(
  supabase: Client,
  userId: string,
  gameId: string,
): Promise<{ error?: string }> {
  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (!game) {
    return { error: "Game not found" };
  }

  const leaveError = canLeaveGame(game);
  if (leaveError) {
    return { error: leaveError };
  }

  const isCreator = game.created_by === userId;

  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("game_id", gameId)
    .eq("user_id", userId);

  if (error) {
    return { error: error.message };
  }

  if (isCreator) {
    const { data: remaining } = await supabase
      .from("rsvps")
      .select("user_id, joined_at")
      .eq("game_id", gameId)
      .order("joined_at", { ascending: true });

    if (!remaining?.length) {
      await supabase
        .from("games")
        .update({
          status: "cancelled",
          cancelled_reason: "Creator left, no remaining players",
        })
        .eq("id", gameId);

      const { data: cancelled } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();
      const { data: host } = await supabase
        .from("profiles")
        .select("display_name, handle")
        .eq("id", userId)
        .single();
      if (cancelled && host) {
        await dispatchGameWebhook("game.cancelled", cancelled, host);
      }
    } else {
      const nextHost = remaining[0]!.user_id;
      await supabase
        .from("games")
        .update({ created_by: nextHost })
        .eq("id", gameId);
    }
  }

  revalidatePath("/");
  revalidatePath(`/games/${gameId}`);
  return {};
}

export async function cancelGame(
  supabase: Client,
  userId: string,
  gameId: string,
  reason?: string,
): Promise<{ error?: string }> {
  const { data: game } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (!game) {
    return { error: "Game not found" };
  }
  if (game.created_by !== userId) {
    return { error: "Only the host can cancel this game" };
  }

  const { data: updated, error } = await supabase
    .from("games")
    .update({
      status: "cancelled",
      cancelled_reason: reason ?? "Cancelled by host",
    })
    .eq("id", gameId)
    .select()
    .single();

  if (error || !updated) {
    return { error: error?.message ?? "Failed to cancel" };
  }

  const { data: host } = await supabase
    .from("profiles")
    .select("display_name, handle")
    .eq("id", userId)
    .single();

  if (host) {
    await dispatchGameWebhook("game.cancelled", updated, host);
  }

  revalidatePath("/");
  revalidatePath(`/games/${gameId}`);
  return {};
}

export async function updateGame(
  supabase: Client,
  userId: string,
  gameId: string,
  raw: UpdateGameInput,
  options?: { canChangeMaxPlayers?: boolean },
): Promise<{ game?: GameRow; error?: string }> {
  const parsed = updateGameSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { data: existing } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (!existing) {
    return { error: "Game not found" };
  }
  if (existing.created_by !== userId) {
    return { error: "Only the host can edit this game" };
  }
  if (existing.status === "cancelled" || existing.status === "completed") {
    return { error: "This game can no longer be edited." };
  }

  const canChangeMaxPlayers = options?.canChangeMaxPlayers ?? true;
  const ruleError = validateUpdateGame(
    existing,
    parsed.data,
    canChangeMaxPlayers,
  );
  if (ruleError) {
    return { error: ruleError };
  }

  const input = parsed.data;
  const patch: {
    title?: string;
    description?: string | null;
    starts_at?: string;
    duration_minutes?: number;
    max_players?: number;
  } = {};
  if (input.title !== undefined) {
    patch.title = input.title;
  }
  if (input.description !== undefined) {
    patch.description = input.description;
  }
  if (input.startsAt !== undefined) {
    patch.starts_at = input.startsAt;
  }
  if (input.durationMinutes !== undefined) {
    patch.duration_minutes = input.durationMinutes;
  }
  if (input.maxPlayers !== undefined) {
    patch.max_players = input.maxPlayers;
  }

  const { data: game, error } = await supabase
    .from("games")
    .update(patch)
    .eq("id", gameId)
    .select()
    .single();

  if (error || !game) {
    return { error: error?.message ?? "Failed to update game" };
  }

  revalidatePath("/");
  revalidatePath(`/games/${gameId}`);
  return { game };
}
