"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createGame } from "@/lib/games/service";
import { requireUser } from "@/lib/auth/require";

export async function createGameAction(formData: FormData) {
  const user = await requireUser("/games/new");
  const supabase = await createClient();

  const result = await createGame(supabase, user.id, {
    gameSlug: String(formData.get("gameSlug") ?? ""),
    activitySlug: String(formData.get("activitySlug") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: (formData.get("description") as string) || null,
    startsAt: String(formData.get("startsAt") ?? ""),
    durationMinutes: Number(formData.get("durationMinutes") ?? 90),
    maxPlayers: Number(formData.get("maxPlayers") ?? 1),
  });

  if (result.error) {
    return { error: result.error };
  }

  if (result.game) {
    redirect(`/games/${result.game.id}`);
  }

  return { error: "Failed to create game" };
}
