import type { QueueStore } from "./queue.interface.js";
import type { MessageStore } from "./storage.interface.js";

class Storage {
    messageStore: MessageStore;
    getQueue(name: string): QueueStore;
}