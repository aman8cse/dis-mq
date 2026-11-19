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
            await queue.enqueue(message.id, message.priority);
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
            const messageId = await queue.claim();
            if (!messageId) return undefined;

            const message = await this.getMessage(messageId);
            if(!message) {
                await queue.noAck(messageId);
                continue;
            }

            // Ignore expired messages (TTL Check).
            if (
                message.expiresAt !== null &&
                message.expiresAt <= Date.now()
            ) {
                await queue.noAck(messageId);
                await this.storage.messageStore.delete(message.id);
                continue;
            }

            return message;
        }
    }

    async ack(queueName: string, messageId: string): Promise<boolean> {
        const queue = this.storage.getQueue(queueName);

        const acknowledged = await queue.ack(messageId);

        if (acknowledged) {
            await this.storage.messageStore.delete(messageId);
        }

        return acknowledged;
    }

    async noAck(queueName: string, messageId: string): Promise<void> {
        const message = await this.getMessage(messageId);
        if (!message) return;

        message.state.retryCount++;

        const queue = this.storage.getQueue(queueName);
        const acknowledged = await queue.noAck(messageId);

        if(!acknowledged) return;

        if (message?.state.maxRetries <= message?.state.retryCount) {
            const DLQ = this.storage.getDLQ(queueName);

            message.state.status = "failed";
            await DLQ.enqueue(message.id, message.priority);
        } else {
            const delayedQ = this.storage.getDelayedQ(queueName);

            //calculate next try
            message.state.status = "delayed";
            await delayedQ.enqueue(message.id, message.priority);
        }
        await this.storage.messageStore.set(message);
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