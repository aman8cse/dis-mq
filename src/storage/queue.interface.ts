import type { Message } from "../core/types.js";

export interface QueueStore {
    enqueue(message: Message): Promise<void>;
    dequeue(): Promise<Message | undefined>;
    peek(): Promise<Message | undefined>;
    size(): Promise<number>;
}