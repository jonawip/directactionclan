import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

export async function resolveIngressToken(
  request: Request,
): Promise<{ isIngress: boolean; error?: Response }> {
  const authHeader = request.headers.get("authorization");
  const token = process.env.API_INGRESS_TOKEN;

  if (!authHeader?.startsWith("Bearer ")) {
    return { isIngress: false };
  }

  const bearer = authHeader.slice(7);
  if (token && bearer === token) {
    return { isIngress: true };
  }

  return {
    isIngress: false,
    error: Response.json({ error: "Invalid token" }, { status: 401 }),
  };
}

export async function getSessionUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireApiUser(request: Request) {
  const ingress = await resolveIngressToken(request);
  if (ingress.error) {
    return { user: null as User | null, isIngress: false, error: ingress.error };
  }

  if (ingress.isIngress) {
    return { user: null as User | null, isIngress: true, admin: createAdminClient() };
  }

  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      isIngress: false,
      error: Response.json({ error: "Unauthorised" }, { status: 401 }),
    };
  }

  const supabase = await createClient();
  return { user, isIngress: false, supabase };
}
