import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  GAME_START_REMINDERS,
  reminderWindow,
} from "@/lib/cron/game-reminders";
import { dispatchGameWebhook } from "@/lib/discord/webhook";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    authHeader !==
    `Bearer ${process.env.CRON_SECRET ?? process.env.API_INGRESS_TOKEN}`
  ) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const results: { event: string; notified: number }[] = [];

  for (const schedule of GAME_START_REMINDERS) {
    const { start, end } = reminderWindow(now, schedule.minutesBefore);

    const { data: games } = await admin
      .from("games")
      .select("*, profiles!games_created_by_fkey(display_name, handle)")
      .gte("starts_at", start)
      .lte("starts_at", end)
      .in("status", ["open", "full"]);

    let notified = 0;
    for (const row of games ?? []) {
      const { profiles, ...game } = row as typeof row & {
        profiles: { display_name: string; handle: string | null };
      };
      await dispatchGameWebhook(schedule.event, game, profiles);
      notified += 1;
    }

    results.push({ event: schedule.event, notified });
  }

  const total = results.reduce((sum, r) => sum + r.notified, 0);
  return NextResponse.json({ notified: total, reminders: results });
}
