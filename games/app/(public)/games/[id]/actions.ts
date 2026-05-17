"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require";
import { cancelGame, joinGame, leaveGame } from "@/lib/games/service";
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
