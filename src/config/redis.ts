import { Redis } from "ioredis";
import "dotenv/config";

let redisClient: Redis | null = null;

export function getRedisClient() {
    if(redisClient) return redisClient;

    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        throw new Error("REDIS_URL is not configured");
    }

    redisClient = new Redis(redisUrl);
    return redisClient;
}