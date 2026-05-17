import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";
import type { MemberStats } from "@/lib/gamification/ranks";

type Client = SupabaseClient<Database>;

const EMPTY: MemberStats = { joined: 0, hosted: 0 };

export async function fetchMemberStats(
  supabase: Client,
  userId: string,
): Promise<MemberStats> {
  const batch = await fetchMemberStatsBatch(supabase, [userId]);
  return batch.get(userId) ?? EMPTY;
}

export async function fetchMemberStatsBatch(
  supabase: Client,
  userIds: string[],
): Promise<Map<string, MemberStats>> {
  const result = new Map<string, MemberStats>();
  if (userIds.length === 0) {
    return result;
  }

  for (const id of userIds) {
    result.set(id, { ...EMPTY });
  }

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("user_id, games!inner(status)")
    .in("user_id", userIds)
    .neq("games.status", "cancelled");

  for (const row of rsvps ?? []) {
    const uid = row.user_id;
    const current = result.get(uid) ?? { ...EMPTY };
    current.joined += 1;
    result.set(uid, current);
  }

  const { data: hosted } = await supabase
    .from("games")
    .select("created_by")
    .in("created_by", userIds)
    .neq("status", "cancelled");

  for (const row of hosted ?? []) {
    const uid = row.created_by;
    const current = result.get(uid) ?? { ...EMPTY };
    current.hosted += 1;
    result.set(uid, current);
  }

  return result;
}
