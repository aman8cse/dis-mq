import type { Message } from "../../core/types.js";
import type { MessageStore } from "../storage.interface.js";
import { redis } from "../../config/redis.js";
import type { QueueStore } from "../queue.interface.js";

export class RedisPriorityQueue implements QueueStore {
    constructor(
        private readonly name: string,
        private readonly messageStore: MessageStore
    ) {}

    private getKey(): string {
        return `mq:queue:${this.name}`;
    }

    private extractMessageId(member: string): string {
        return member.substring(member.indexOf(":") + 1);
    }

    async enqueue(message: Message): Promise<void> {
        await redis.eval(
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

    async dequeue(): Promise<Message | undefined> {
        const result = await redis.zpopmin(this.getKey());

        if (result.length === 0) return undefined;

        const messageId = this.extractMessageId(result[0]);

        return this.messageStore.get(messageId);
    }

    async peek(): Promise<Message | undefined> {
        const result = await redis.zrange(this.getKey(), 0, 0);

        if (result.length === 0) return undefined;

        const messageId = this.extractMessageId(result[0]);

        return this.messageStore.get(messageId);
    }

    async size(): Promise<number> {
        return redis.zcard(this.getKey());
    }

    async claim(): Promise<Message | undefined> {
        return undefined;
    }

    async ack(messageId: string): Promise<boolean> {
        return false;
    }

    async noAck(messageId: string): Promise<void> {
        
    }
}