import type { Message } from "../../core/types.js";
import type { MessageStore } from "../storage.interface.js";
import type { QueueStore } from "../queue.interface.js";
import { getRedisClient } from "../../config/redis.js";

export class RedisPriorityQueue implements QueueStore {
    constructor(
        private readonly name: string,
        private readonly messageStore: MessageStore
    ) {}

    private get redis() {
        return getRedisClient();
    }

    private getKey(): string {
        return `mq:queue:${this.name}`;
    }

    private extractMessageId(member: string): string {
        return member.substring(member.indexOf(":") + 1);
    }

    async enqueue(messageId: string): Promise<void> {
        await this.redis.eval(
            `
            local sequence = redis.call("INCR", KEYS[2])
            local member = string.format("%016d", sequence) .. ":" .. ARGV[2]
            redis.call("ZADD", KEYS[1], -tonumber(ARGV[1]), member)
            return sequence
            `,
            2,
            this.getKey(),
            `${this.getKey()}:seq`,
            message.priority.toString(),
            message.id
        );
    }

    async dequeue(): Promise<string | undefined> {
        const result = await this.redis.zpopmin(this.getKey());

        if (result.length === 0) return undefined;

        const messageId = this.extractMessageId(result[0]);

        return this.messageStore.get(messageId);
    }

    async peek(): Promise<string | undefined> {
        const result = await this.redis.zrange(this.getKey(), 0, 0);

        if (result.length === 0) return undefined;

        const messageId = this.extractMessageId(result[0]);

        return this.messageStore.get(messageId);
    }

    async size(): Promise<number> {
        return this.redis.zcard(this.getKey());
    }

    async claim(): Promise<string | undefined> {
        return undefined;
    }

    async ack(messageId: string): Promise<boolean> {
        return false;
    }

    async noAck(messageId: string): Promise<boolean> {
        
    }
}