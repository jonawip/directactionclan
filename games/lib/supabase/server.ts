import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { applySessionCookies } from "@/lib/supabase/cookies";
import type { Database } from "@/types/db";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            applySessionCookies(
              (name, value, options) => cookieStore.set(name, value, options),
              cookiesToSet,
            );
          } catch {
            // setAll from Server Component — middleware handles refresh
          }
        },
      },
    },
  );
}
