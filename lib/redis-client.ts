import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient;
  }

  redisClient = createClient({ url: process.env.REDIS_URL });
  
  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
    redisClient = null;
  });

  redisClient.on("end", () => {
    redisClient = null;
  });

  await redisClient.connect();
  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    redisClient = null;
  }
}

