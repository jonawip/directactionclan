const buckets = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

export function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

export function rateLimitKey(
  request: Request,
  userId?: string | null,
): string {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return `token:${auth.slice(7, 20)}`;
  }
  return userId ? `user:${userId}` : `ip:${request.headers.get("x-forwarded-for") ?? "anon"}`;
}
