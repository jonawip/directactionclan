import { NextResponse } from "next/server";
import { rateLimit, rateLimitKey } from "@/lib/api/rate-limit";
import { requireApiUser } from "@/lib/api/auth";
import { joinGame, leaveGame } from "@/lib/games/service";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

/**
 * POST /api/v1/games/:id/rsvp — join
 */
export async function POST(request: Request, { params }: Params) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const key = rateLimitKey(request, auth.user?.id);
  if (!rateLimit(key)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { id } = await params;
  const supabase = auth.isIngress ? createAdminClient() : await createClient();

  let userId = auth.user?.id;
  if (auth.isIngress) {
    const body = await request.json().catch(() => ({}));
    userId = (body as { userId?: string }).userId ?? userId;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const result = await joinGame(supabase, userId, id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}

/**
 * DELETE /api/v1/games/:id/rsvp — leave
 */
export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireApiUser(request);
  if (auth.error) return auth.error;

  const { id } = await params;
  const supabase = auth.isIngress ? createAdminClient() : await createClient();

  let userId = auth.user?.id;
  if (auth.isIngress) {
    const body = await request.json().catch(() => ({}));
    userId = (body as { userId?: string }).userId ?? userId;
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const result = await leaveGame(supabase, userId, id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
