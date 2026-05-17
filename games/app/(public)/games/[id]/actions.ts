"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require";
import {
  cancelGame,
  joinGame,
  leaveGame,
  updateGame,
} from "@/lib/games/service";
import { createClient } from "@/lib/supabase/server";

export async function joinGameAction(gameId: string) {
  const user = await requireUser(`/games/${gameId}`);
  const supabase = await createClient();
  const result = await joinGame(supabase, user.id, gameId);
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath(`/games/${gameId}`);
  return {};
}

export async function leaveGameAction(gameId: string) {
  const user = await requireUser(`/games/${gameId}`);
  const supabase = await createClient();
  const result = await leaveGame(supabase, user.id, gameId);
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath(`/games/${gameId}`);
  return {};
}

export async function cancelGameAction(gameId: string, reason?: string) {
  const user = await requireUser(`/games/${gameId}`);
  const supabase = await createClient();
  const result = await cancelGame(supabase, user.id, gameId, reason);
  if (result.error) {
    return { error: result.error };
  }
  revalidatePath(`/games/${gameId}`);
  revalidatePath("/");
  return {};
}

export async function updateGameAction(formData: FormData) {
  const gameId = String(formData.get("gameId") ?? "");
  const user = await requireUser(`/games/${gameId}`);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("games")
    .select("created_by")
    .eq("id", gameId)
    .single();

  if (!existing) {
    return { error: "Game not found" };
  }

  const { count: otherRsvpCount } = await supabase
    .from("rsvps")
    .select("*", { count: "exact", head: true })
    .eq("game_id", gameId)
    .neq("user_id", existing.created_by);

  const maxPlayersRaw = formData.get("maxPlayers");
  const result = await updateGame(
    supabase,
    user.id,
    gameId,
    {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? "") || null,
      startsAt: String(formData.get("startsAt") ?? ""),
      durationMinutes: Number(formData.get("durationMinutes")),
      maxPlayers: maxPlayersRaw ? Number(maxPlayersRaw) : undefined,
    },
    { canChangeMaxPlayers: (otherRsvpCount ?? 0) === 0 },
  );

  if (result.error) {
    return { error: result.error };
  }

  revalidatePath(`/games/${gameId}`);
  revalidatePath("/");
  return {};
}
