import { createMessage } from "../core/message.js";
import type { Message, MessageInput } from "../core/types.js";
import type { Storage } from "../storage/storage.js";

export class Broker {
    constructor(private readonly storage: Storage) { }

    async publish(
        queueName: string,
        input: MessageInput,
    ): Promise<Message> {
        const message = createMessage(input);

        const queue = this.storage.getQueue(queueName);

        await this.storage.messageStore.set(message);

        try {
            await queue.enqueue(message);
        } catch (error) {
            // Compensate for failed enqueue.
            await this.storage.messageStore.delete(message.id);
            throw error;
        }

        return message;
    }

    async consume(queueName: string): Promise<Message | undefined> {
        const queue = this.storage.getQueue(queueName);

        while (true) {
            const message = await queue.claim();

            if (!message) return undefined;

            // Ignore expired messages.
            if (
                message.expiresAt !== null &&
                message.expiresAt <= Date.now()
            ) {
                await this.storage.messageStore.delete(message.id);
                continue;
            }

            return message;
        }
    }

    async ack(queueName: string, messageId: string): Promise<boolean> {
        const queue = this.storage.getQueue(queueName);

        const acknowledged = await queue.ack(messageId);

        if(acknowledged) {
            await this.storage.messageStore.delete(messageId);
        }

        return acknowledged;
    }

    async noAck(queueName: string, messageId: string): Promise<void> {
        const queue = this.storage.getQueue(queueName);

        await queue.noAck(messageId);
    }

    async getMessage(
        messageId: string,
    ): Promise<Message | undefined> {
        return this.storage.messageStore.get(messageId);
    }

    async size(queueName: string): Promise<number> {
        return this.storage.getQueue(queueName).size();
    }
}