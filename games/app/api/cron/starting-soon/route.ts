import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dispatchGameWebhook } from "@/lib/discord/webhook";
import { addMinutes } from "date-fns";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? process.env.API_INGRESS_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const windowStart = addMinutes(now, 15).toISOString();
  const windowEnd = addMinutes(now, 20).toISOString();

  const { data: games } = await admin
    .from("games")
    .select("*, profiles!games_created_by_fkey(display_name, handle)")
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd)
    .in("status", ["open", "full"]);

  if (!games?.length) {
    return NextResponse.json({ notified: 0 });
  }

  let notified = 0;
  for (const row of games) {
    const { profiles, ...game } = row as typeof row & {
      profiles: { display_name: string; handle: string | null };
    };
    await dispatchGameWebhook("game.starting", game, profiles);
    notified += 1;
  }

  return NextResponse.json({ notified });
}
