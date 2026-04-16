import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

type RedisCache = {
  client: Redis | null;
};

const redisCache = globalThis as typeof globalThis & {
  redisCache?: RedisCache;
};

if (!redisCache.redisCache) {
  redisCache.redisCache = { client: null };
}

export function getRedisClient() {
  if (!REDIS_URL) {
    return null;
  }

  if (!redisCache.redisCache!.client) {
    redisCache.redisCache!.client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableAutoPipelining: true,
    });
  }

  return redisCache.redisCache!.client;
}
