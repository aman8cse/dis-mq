import { getRedisClient } from "../../config/redis.js";
import type { Message } from "../../core/types.js";
import type { MessageStore } from "../storage.interface.js";

export class RedisStore implements MessageStore {
    private prefix = "mq:message:";

    private get redis() {
        return getRedisClient();
    }

    async set(message: Message): Promise<void> {
        await this.redis.set(
            `${this.prefix}${message.id}`,
            JSON.stringify(message)
        );
    }

    async get(messageId: string): Promise<Message | undefined> {
        const data = await this.redis.get(`${this.prefix}${messageId}`);

        if (!data) return undefined;

        return JSON.parse(data) as Message;
    }

    async delete(messageId: string): Promise<boolean> {
        const result = await this.redis.del(`${this.prefix}${messageId}`);
        return result > 0;
    }

    async has(messageId: string): Promise<boolean> {
        return (await this.redis.exists(`${this.prefix}${messageId}`)) > 0;
    }

    async size(): Promise<number> {
        const keys = await this.redis.keys(`${this.prefix}*`);
        return keys.length;
    }

    async clear(): Promise<void> {
        const keys = await this.redis.keys(`${this.prefix}*`);

        if (keys.length > 0) {
            await this.redis.del(...keys);
        }
    }
}