import type { Message } from "../core/types.js";

export interface QueueStore {
  enqueue(message: Message): Promise<void>;
  claim(): Promise<Message | undefined>;
  ack(messageId: string): Promise<boolean>;
  noAck(messageId: string): Promise<void>;
  peek(): Promise<Message | undefined>;
  size(): Promise<number>;
}