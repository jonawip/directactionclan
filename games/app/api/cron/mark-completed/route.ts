import { isBefore } from "date-fns";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gameEndTime } from "@/lib/games/rules";

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

  const { data: games, error } = await admin
    .from("games")
    .select("id, starts_at, duration_minutes, status")
    .in("status", ["open", "full"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ids = (games ?? [])
    .filter((g) => !isBefore(now, gameEndTime(g)))
    .map((g) => g.id);

  if (ids.length === 0) {
    return NextResponse.json({ completed: 0 });
  }

  const { error: updateError } = await admin
    .from("games")
    .update({ status: "completed" })
    .in("id", ids);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ completed: ids.length });
}
