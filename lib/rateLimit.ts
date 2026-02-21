import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

export async function getCreditsStatus(ip: string): Promise<{
  demo: boolean;
  limit: number;
  remaining: number;
}> {
  const isDemo = process.env.DEMO === "true";
  const limit = Number(process.env.DEMO_CREDITS_PER_DAY ?? 5);

  if (!isDemo) return { demo: false, limit, remaining: -1 };

  const date = new Date().toISOString().slice(0, 10);
  const key = `demo:ratelimit:${ip}:${date}`;

  try {
    const client = getRedis();
    const count = (await client.get<number>(key)) ?? 0;
    return { demo: true, limit, remaining: Math.max(0, limit - count) };
  } catch {
    return { demo: true, limit, remaining: limit };
  }
}

export async function checkRateLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  const isDemo = process.env.DEMO === "true";
  if (!isDemo) return { allowed: true, remaining: -1 };

  const limit = Number(process.env.DEMO_CREDITS_PER_DAY ?? 5);
  const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const key = `demo:ratelimit:${ip}:${date}`;

  try {
    const client = getRedis();
    const count = await client.incr(key);

    if (count === 1) {
      // Set TTL on first request of the day so it auto-resets
      await client.expire(key, 86400);
    }

    const remaining = Math.max(0, limit - count);
    return { allowed: count <= limit, remaining };
  } catch (err) {
    // Fail open — if Redis is unreachable, don't block the user
    console.warn("[rateLimit] Redis error, failing open:", err);
    return { allowed: true, remaining: -1 };
  }
}
