import type { MessageInput, Message } from "../core/types.js";
import { createMessage } from "../core/message.js";
import type { MessageStore } from "../storage/storage.interface.js";
import type { QueueStore } from "../storage/queue.interface.js";

export class Broker {
    constructor(
        private readonly messageStore: MessageStore,
        private readonly queueStore: QueueStore
    ) {}

    async publish(input: MessageInput): Promise<Message> {
        const message = createMessage(input);

        await this.queueStore.enqueue(message);

        return message;
    }

    async getMessage(messageId: string): Promise<Message | undefined> {
        return this.messageStore.get(messageId);
    }

    async consume(): Promise<Message | undefined> {
        return this.queueStore.dequeue();
    }

    async size(): Promise<number> {
        return this.queueStore.size();
    }
}