import { Consumer } from "../consumer/consumer.js";
import type { Message } from "../core/types.js";

export type MessageHandler = (message: Message) => Promise<void> | void;

export class Worker {
    private running = false;
    private loopPromise?: Promise<void>;

    constructor(private readonly consumer: Consumer, private readonly handler: MessageHandler) {
    }

    start(): void {
        if (this.running) return;

        this.running = true;
        this.loopPromise = this.processLoop();
    }

    private async processLoop(): Promise<void> {
        while (this.running) {
            try {
                const message = await this.consumer.consume();

                if (!message) {
                    await this.sleep(250);
                    continue;
                }

                let res = await this.handler(message);

                await this.consumer.ack(message.id);
            } catch (error) {
                console.error("Worker processing error: ", error);
                await this.sleep(1000);
            }
        }
    }

    async stop(): Promise<void> {
        this.running = false;
        await this.loopPromise;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}