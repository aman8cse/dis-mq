import type { Message } from "../core/types.js";

export interface QueueStore {
  enqueue(messageId: string, priority: number): Promise<void>;
  claim(): Promise<string | undefined>;
  ack(messageId: string): Promise<boolean>;
  noAck(messageId: string): Promise<boolean>;
  peek(): Promise<string | undefined>;
  size(): Promise<number>;
}