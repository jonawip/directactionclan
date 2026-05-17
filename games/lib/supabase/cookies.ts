import type { CookieOptions } from "@supabase/ssr";

/** Default 30 days — align with Supabase refresh token lifetime in the dashboard. */
export const SESSION_COOKIE_MAX_AGE = Number(
  process.env.SESSION_COOKIE_MAX_AGE ?? 60 * 60 * 24 * 30,
);

function isSupabaseAuthCookie(name: string): boolean {
  return name.startsWith("sb-");
}

export function withPersistentSessionOptions(
  name: string,
  value: string,
  options?: CookieOptions,
): { name: string; value: string; options: CookieOptions } {
  if (!isSupabaseAuthCookie(name)) {
    return { name, value, options: options ?? {} };
  }

  const clearing = !value || options?.maxAge === 0;

  return {
    name,
    value,
    options: {
      ...options,
      path: options?.path ?? "/",
      sameSite: options?.sameSite ?? "lax",
      secure:
        options?.secure ??
        (process.env.NODE_ENV === "production" ||
          process.env.VERCEL === "1"),
      httpOnly: options?.httpOnly ?? true,
      ...(clearing
        ? { maxAge: 0 }
        : { maxAge: SESSION_COOKIE_MAX_AGE }),
    },
  };
}

export function applySessionCookies(
  setCookie: (name: string, value: string, options: CookieOptions) => void,
  cookiesToSet: { name: string; value: string; options?: CookieOptions }[],
): void {
  for (const { name, value, options } of cookiesToSet) {
    const merged = withPersistentSessionOptions(name, value, options);
    setCookie(merged.name, merged.value, merged.options);
  }
}
