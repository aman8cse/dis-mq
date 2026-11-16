import type { MessageStore } from "./storage.interface.js";
import type { QueueStore } from "./queue.interface.js";

import { MemoryStore } from "./memory/memory-store.js";
import { PriorityQueue } from "./memory/priority-queue.js";

import { RedisStore } from "./redis/redis-store.js";
import { RedisPriorityQueue } from "./redis/redis-priority-queue.js";

export class Storage {
  readonly messageStore: MessageStore;

  private readonly queues = new Map<string, QueueStore>();
  private readonly backend: "memory" | "redis";

  constructor() {
    if (process.env.REDIS_URL) {
      this.backend = "redis";
      this.messageStore = new RedisStore();
    } else {
      this.backend = "memory";
      this.messageStore = new MemoryStore();
    }
  }

  getQueue(name: string): QueueStore {
    const existingQueue = this.queues.get(name);

    if (existingQueue) {
      return existingQueue;
    }

    let queue: QueueStore;

    if (this.backend === "redis") {
      queue = new RedisPriorityQueue(name, this.messageStore);
    } else {
      queue = new PriorityQueue();
    }

    this.queues.set(name, queue);

    return queue;
  }
}