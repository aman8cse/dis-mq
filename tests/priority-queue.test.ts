import { describe, it, expect } from "vitest";
import { PriorityQueue } from "../src/storage/memory/priority-queue.js";
import { createMessage } from "../src/core/message.js";

describe("PriorityQueue", () => {
    it("should dequeue higher priority messages first", () => {
        const queue = new PriorityQueue();

        const low = createMessage({ payload: "low", priority: 1 });
        const high = createMessage({ payload: "high", priority: 10 });
        const medium = createMessage({ payload: "medium", priority: 5 });

        queue.enqueue(low);
        queue.enqueue(high);
        queue.enqueue(medium);

        expect(queue.dequeue()?.id).toBe(high.id);
        expect(queue.dequeue()?.id).toBe(medium.id);
        expect(queue.dequeue()?.id).toBe(low.id);
    });

    it("should maintain FIFO for equal priorities", () => {
        const queue = new PriorityQueue();

        const first = createMessage({ payload: "first", priority: 5 });
        const second = createMessage({ payload: "second", priority: 5 });
        const third = createMessage({ payload: "third", priority: 5 });

        queue.enqueue(first);
        queue.enqueue(second);
        queue.enqueue(third);

        expect(queue.dequeue()?.id).toBe(first.id);
        expect(queue.dequeue()?.id).toBe(second.id);
        expect(queue.dequeue()?.id).toBe(third.id);
    });

    it("should return undefined when empty", () => {
        const queue = new PriorityQueue();

        expect(queue.dequeue()).toBeUndefined();
    });

    it("should peek without removing", () => {
        const queue = new PriorityQueue();

        const message = createMessage({ payload: "test" });
        queue.enqueue(message);

        expect(queue.peek()?.id).toBe(message.id);
        expect(queue.size()).toBe(1);
    });

    it("should update size correctly", () => {
        const queue = new PriorityQueue();

        queue.enqueue(createMessage({ payload: "a" }));
        queue.enqueue(createMessage({ payload: "b" }));

        expect(queue.size()).toBe(2);

        queue.dequeue();

        expect(queue.size()).toBe(1);
    });
});