import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { applySessionCookies } from "@/lib/supabase/cookies";
import type { Database } from "@/types/db";

export function createRouteHandlerClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          applySessionCookies(
            (name, value, options) =>
              response.cookies.set(name, value, options),
            cookiesToSet,
          );
        },
      },
    },
  );
}
