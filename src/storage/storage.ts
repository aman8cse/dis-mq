import type { MessageStore } from "./storage.interface.js";
import type { QueueStore } from "./queue.interface.js";

import { MemoryStore } from "./memory/memory-store.js";
import { PriorityQueue } from "./memory/priority-queue.js";

import { RedisStore } from "./redis/redis-store.js";
import { RedisPriorityQueue } from "./redis/redis-priority-queue.js";

export class Storage {
  readonly messageStore: MessageStore;

  private readonly queues = new Map<string, QueueStore>();
  private readonly DLQ = new Map<string, QueueStore>();
  private readonly delayedQ = new Map<string, QueueStore>();
  private readonly backend: string;

  constructor({backend = "memory"}) {
    if (process.env.REDIS_URL) {
      this.backend = backend;
      this.messageStore = new RedisStore();
    } else {
      this.backend = backend;
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

  getDLQ(name: string): QueueStore {
    const existingDLQ = this.DLQ.get(name);

    if (existingDLQ) {
      return existingDLQ;
    }

    let DLQ: QueueStore;

    if (this.backend === "redis") {
      DLQ = new RedisPriorityQueue(name, this.messageStore);
    } else {
      DLQ = new PriorityQueue();
    }

    this.queues.set(name, DLQ);

    return DLQ;
  }

  getDelayedQ(name: string): QueueStore {
    const existingdelayedQ = this.delayedQ.get(name);

    if (existingdelayedQ) {
      return existingdelayedQ;
    }

    let delayedQ: QueueStore;

    if (this.backend === "redis") {
      delayedQ = new RedisPriorityQueue(name, this.messageStore);
    } else {
      delayedQ = new PriorityQueue();
    }

    this.queues.set(name, delayedQ);

    return delayedQ;
  }
}