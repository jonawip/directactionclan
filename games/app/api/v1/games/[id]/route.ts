import { NextResponse } from "next/server";
import { rateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import { requireApiUser, resolveIngressToken } from "@/lib/api/auth";
import { cancelGame } from "@/lib/games/service";
import { fetchGameById } from "@/lib/games/queries";
import { updateGameSchema, validateCreateGame } from "@/lib/games/rules";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/games/:id — single game with RSVPs
 */
export async function GET(request: Request, { params }: Params) {
  const ingress = await resolveIngressToken(request);
  if (ingress.error) return ingress.error;

  const { id } = await params;
  const supabase = ingress.isIngress ? createAdminClient() : await createClient();
  const game = await fetchGameById(supabase, id);

  if (!game) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ game });
}

/**
 * PATCH /api/v1/games/:id — owner edits
 */
export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;
  if (auth.isIngress) {
    return NextResponse.json({ error: "Use session auth for PATCH" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const parsed = updateGameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (!existing || existing.created_by !== auth.user!.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = parsed.data;
  if (updates.startsAt) {
    const err = validateCreateGame({
      gameSlug: existing.game_slug,
      activitySlug: existing.activity_slug,
      title: updates.title ?? existing.title,
      startsAt: updates.startsAt,
      durationMinutes: updates.durationMinutes ?? existing.duration_minutes,
      maxPlayers: updates.maxPlayers ?? existing.max_players,
    });
    if (err) {
      return NextResponse.json({ error: err }, { status: 400 });
    }
  }

  const { data: game, error } = await supabase
    .from("games")
    .update({
      title: updates.title,
      description: updates.description,
      starts_at: updates.startsAt,
      duration_minutes: updates.durationMinutes,
      max_players: updates.maxPlayers,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ game });
}

/**
 * DELETE /api/v1/games/:id — soft cancel
 */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const key = rateLimitKey(request, auth.user?.id);
  if (!rateLimit(key)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { id } = await params;
  const supabase = auth.isIngress ? createAdminClient() : await createClient();
  const userId = auth.user?.id;

  if (!userId && !auth.isIngress) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Ingress cancel requires user context" }, { status: 400 });
  }

  const result = await cancelGame(supabase, userId, id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
