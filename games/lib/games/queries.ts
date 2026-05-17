import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";
import type { GameWithRsvps, RsvpWithProfile } from "@/types/domain";

type Client = SupabaseClient<Database>;

const gameSelect = `
  *,
  creator:profiles!games_created_by_fkey(id, display_name, handle, avatar_url),
  rsvps(
    game_id,
    user_id,
    joined_at,
    profiles(id, display_name, handle, avatar_url)
  )
`;

export async function fetchUpcomingGames(
  supabase: Client,
  options?: {
    gameSlugs?: string[];
    activitySlugs?: string[];
    openOnly?: boolean;
    excludeUserId?: string;
    from?: string;
    to?: string;
    limit?: number;
  },
): Promise<GameWithRsvps[]> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("games")
    .select(gameSelect)
    .gte("starts_at", options?.from ?? oneHourAgo)
    .neq("status", "completed")
    .order("starts_at", { ascending: true });

  if (options?.to) {
    query = query.lte("starts_at", options.to);
  }
  if (options?.gameSlugs?.length) {
    query = query.in("game_slug", options.gameSlugs);
  }
  if (options?.activitySlugs?.length) {
    query = query.in("activity_slug", options.activitySlugs);
  }
  if (options?.openOnly) {
    query = query.eq("status", "open");
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) {
    return [];
  }

  let games = data.map(normaliseGame);

  if (options?.excludeUserId) {
    games = games.filter(
      (g) => !g.rsvps.some((r) => r.user_id === options.excludeUserId),
    );
  }

  return games;
}

export async function fetchGameById(
  supabase: Client,
  id: string,
): Promise<GameWithRsvps | null> {
  const { data, error } = await supabase
    .from("games")
    .select(gameSelect)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return normaliseGame(data);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseGame(row: any): GameWithRsvps {
  const rsvps: RsvpWithProfile[] = (row.rsvps ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => ({
      game_id: r.game_id,
      user_id: r.user_id,
      joined_at: r.joined_at,
      profiles: r.profiles,
    }),
  );

  rsvps.sort(
    (a, b) =>
      new Date(a.joined_at).getTime() - new Date(b.joined_at).getTime(),
  );

  const { creator, rsvps: _rsvps, ...game } = row;
  void _rsvps;

  return {
    ...game,
    creator: creator ?? {
      id: game.created_by,
      display_name: "Unknown",
      handle: null,
      avatar_url: null,
    },
    rsvps,
  };
}
