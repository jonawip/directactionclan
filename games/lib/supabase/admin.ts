import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

export function hasAdminCredentials(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getAdminClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAdminClient(): SupabaseClient<Database> {
  const client = getAdminClient();
  if (!client) {
    throw new Error("Missing Supabase admin credentials");
  }
  return client;
}
