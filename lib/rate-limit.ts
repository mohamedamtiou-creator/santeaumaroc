/**
 * In-memory rate limiter (per process).
 * Sufficient for single-instance deployments; swap for Redis/Upstash on multi-instance.
 */

type Window = { count: number; resetAt: number };

const store = new Map<string, Window>();

// Clean up expired entries every 15 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, w] of store.entries()) {
    if (w.resetAt < now) store.delete(key);
  }
}, 15 * 60 * 1_000);

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { success: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  let w = store.get(key);

  if (!w || w.resetAt < now) {
    w = { count: 1, resetAt: now + windowMs };
    store.set(key, w);
    return { success: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (w.count >= maxRequests) {
    return { success: false, remaining: 0, retryAfterMs: w.resetAt - now };
  }

  w.count++;
  return { success: true, remaining: maxRequests - w.count, retryAfterMs: 0 };
}
