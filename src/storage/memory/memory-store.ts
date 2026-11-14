import type { Message } from "../../core/types.js";
import type { MessageStore } from "../storage.interface.js";

export class MemoryStore implements MessageStore {
    private messages = new Map<string, Message>();

    async set(message: Message): Promise<void> {
        this.messages.set(message.id, message);
    }

    async get(messageId: string): Promise<Message | undefined> {
        return this.messages.get(messageId);
    }

    async delete(messageId: string): Promise<boolean> {
        return this.messages.delete(messageId);
    }

    async has(messageId: string): Promise<boolean> {
        return this.messages.has(messageId);
    }

    async size(): Promise<number> {
        return this.messages.size;
    }

    async clear(): Promise<void> {
        this.messages.clear();
    }
}