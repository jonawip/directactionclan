import type { SupabaseClient } from "@supabase/supabase-js";
import { getDegenerateTitle } from "@/lib/gamification/degenerate";
import {
  resolveMemberRanks,
  type MemberStats,
  type ResolvedMemberRanks,
} from "@/lib/gamification/ranks";
import type { Database } from "@/types/db";

type Client = SupabaseClient<Database>;

export type LeaderboardProfile = {
  id: string;
  display_name: string;
  handle: string | null;
  avatar_url: string | null;
};

export type LeaderboardEntry = {
  profile: LeaderboardProfile;
  stats: MemberStats;
  ranks: ResolvedMemberRanks;
  degenerateTitle: string;
};

export type LeaderboardBoard = {
  id: "joined" | "hosted";
  entries: LeaderboardEntry[];
};

async function fetchAllMemberStats(
  supabase: Client,
): Promise<Map<string, MemberStats>> {
  const result = new Map<string, MemberStats>();

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("user_id, games!inner(status)")
    .neq("games.status", "cancelled");

  for (const row of rsvps ?? []) {
    const current = result.get(row.user_id) ?? { joined: 0, hosted: 0 };
    current.joined += 1;
    result.set(row.user_id, current);
  }

  const { data: hosted } = await supabase
    .from("games")
    .select("created_by")
    .neq("status", "cancelled");

  for (const row of hosted ?? []) {
    const current = result.get(row.created_by) ?? { joined: 0, hosted: 0 };
    current.hosted += 1;
    result.set(row.created_by, current);
  }

  return result;
}

function buildBoard(
  profiles: Map<string, LeaderboardProfile>,
  statsMap: Map<string, MemberStats>,
  board: "joined" | "hosted",
  limit = 25,
): LeaderboardBoard {
  const sorted = [...statsMap.entries()]
    .filter(([, stats]) => (board === "joined" ? stats.joined : stats.hosted) > 0)
    .sort((a, b) => {
      const diff =
        (board === "joined" ? b[1].joined - a[1].joined : b[1].hosted - a[1].hosted);
      if (diff !== 0) {
        return diff;
      }
      return (
        (board === "joined" ? b[1].hosted - a[1].hosted : b[1].joined - a[1].joined)
      );
    })
    .slice(0, limit);

  const entries: LeaderboardEntry[] = [];

  sorted.forEach(([userId, stats], index) => {
    const profile = profiles.get(userId);
    if (!profile) {
      return;
    }
    const ranks = resolveMemberRanks(stats);
    entries.push({
      profile,
      stats,
      ranks,
      degenerateTitle: getDegenerateTitle(stats, userId, {
        board,
        rank: index + 1,
        totalOnBoard: sorted.length,
      }),
    });
  });

  return { id: board, entries };
}

export async function fetchLeaderboards(
  supabase: Client,
): Promise<{ joined: LeaderboardBoard; hosted: LeaderboardBoard }> {
  const statsMap = await fetchAllMemberStats(supabase);
  const userIds = [...statsMap.keys()];

  if (userIds.length === 0) {
    return {
      joined: { id: "joined", entries: [] },
      hosted: { id: "hosted", entries: [] },
    };
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, handle, avatar_url")
    .in("id", userIds);

  const profileMap = new Map<string, LeaderboardProfile>();
  for (const p of profiles ?? []) {
    profileMap.set(p.id, p);
  }

  return {
    joined: buildBoard(profileMap, statsMap, "joined"),
    hosted: buildBoard(profileMap, statsMap, "hosted"),
  };
}
