import { NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import {
  getSessionUser,
  requireApiUser,
  resolveIngressToken,
} from "@/lib/api/auth";
import { createGame } from "@/lib/games/service";
import { createGameSchema } from "@/lib/games/rules";
import { fetchUpcomingGames } from "@/lib/games/queries";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/v1/games — list upcoming games
 * Query: game, activity, from, to, status, limit
 */
export async function GET(request: Request) {
  const ingress = await resolveIngressToken(request);
  if (ingress.error) return ingress.error;

  const user = await getSessionUser();
  const key = rateLimitKey(request, user?.id);
  if (!rateLimit(key)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const gameSlugs = searchParams.getAll("game");
  const activitySlugs = searchParams.getAll("activity");
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const limit = searchParams.get("limit")
    ? Number(searchParams.get("limit"))
    : undefined;

  const supabase = ingress.isIngress ? createAdminClient() : await createClient();

  const games = await fetchUpcomingGames(supabase, {
    gameSlugs: gameSlugs.length ? gameSlugs : undefined,
    activitySlugs: activitySlugs.length ? activitySlugs : undefined,
    from,
    to,
    limit,
    openOnly: searchParams.get("status") === "open",
  });

  return NextResponse.json({ games });
}

/**
 * POST /api/v1/games — create a game (auth or ingress token)
 */
export async function POST(request: Request) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const key = rateLimitKey(request, auth.user?.id);
  if (!rateLimit(key)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const apiBody = z
    .object({
      gameSlug: z.string(),
      activitySlug: z.string(),
      title: z.string(),
      description: z.string().nullable().optional(),
      startsAt: z.string(),
      durationMinutes: z.number().optional(),
      maxPlayers: z.number(),
      createdBy: z.string().uuid().optional(),
    })
    .safeParse(body);

  if (!apiBody.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const input = createGameSchema.parse({
    gameSlug: apiBody.data.gameSlug,
    activitySlug: apiBody.data.activitySlug,
    title: apiBody.data.title,
    description: apiBody.data.description,
    startsAt: apiBody.data.startsAt,
    durationMinutes: apiBody.data.durationMinutes ?? 90,
    maxPlayers: apiBody.data.maxPlayers,
  });

  const userId =
    auth.isIngress && apiBody.data.createdBy
      ? apiBody.data.createdBy
      : auth.user!.id;

  const supabase = auth.isIngress ? createAdminClient() : await createClient();
  const result = await createGame(supabase, userId, input);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ game: result.game }, { status: 201 });
}
