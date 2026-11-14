import type { Message } from "../core/types.js";

export interface MessageStore {
    set(message: Message): Promise<void>;
    get(messageId: string): Promise<Message | undefined>;
    delete(messageId: string): Promise<boolean>;
    has(messageId: string): Promise<boolean>;
    size(): Promise<number>;
    clear(): Promise<void>;
}