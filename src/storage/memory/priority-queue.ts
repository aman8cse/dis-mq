import type { Message } from "../../core/types.js";
import type { QueueStore } from "../queue.interface.js";

type HeapEntry = {
    messageId: string;
    priority: number;
    sequence: number;
};

export class PriorityQueue implements QueueStore {
    private heap: HeapEntry[] = [];
    private sequence = 0;

    private processing = new Set<string>();

    // Higher priority comes first.
    // For equal priority, older messages come first.
    private hasHigherPriority(a: HeapEntry, b: HeapEntry): boolean {
        if (a.priority !== b.priority) {
            return a.priority > b.priority;
        }

        return a.sequence < b.sequence;
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Move an element upward to restore heap property.
    private heapifyUp(index: number): void {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);

            if (!this.hasHigherPriority(this.heap[index], this.heap[parent])) {
                break;
            }

            this.swap(index, parent);
            index = parent;
        }
    }

    // Move an element downward to restore heap property.
    private heapifyDown(index: number): void {
        const size = this.heap.length;

        while (true) {
            let highest = index;

            const left = 2 * index + 1;
            const right = 2 * index + 2;

            if (
                left < size &&
                this.hasHigherPriority(this.heap[left], this.heap[highest])
            ) {
                highest = left;
            }

            if (
                right < size &&
                this.hasHigherPriority(this.heap[right], this.heap[highest])
            ) {
                highest = right;
            }

            if (highest === index) break;

            this.swap(index, highest);
            index = highest;
        }
    }

    async enqueue(messageId: string, priority: number): Promise<void> {
        const entry: HeapEntry = {
            messageId,
            priority,
            sequence: this.sequence++
        };

        this.heap.push(entry);
        this.heapifyUp(this.heap.length - 1);
    }

    async dequeue(): Promise<string | undefined> {
        if (this.isEmpty()) {
            return undefined;
        }

        const highestPriority = this.heap[0];

        const last = this.heap.pop()!;

        if (!this.isEmpty()) {
            this.heap[0] = last;
            this.heapifyDown(0);
        }

        return highestPriority?.messageId;
    }

    async peek(): Promise<string | undefined> {
        return this.heap[0]?.messageId;
    }

    async size(): Promise<number> {
        return this.heap.length;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }

    async claim(): Promise<string | undefined> {
        const messageId = await this.dequeue();

        if (!messageId) return undefined;

        this.processing.add(messageId);
        return messageId;
    }

    async ack(messageId: string): Promise<boolean> {
        return this.removeFromProcessing(messageId);
    }

    async noAck(messageId: string): Promise<boolean> {
        return this.removeFromProcessing(messageId);
    }

    async removeFromProcessing(messageId: string): Promise<boolean> {
        return this.processing.delete(messageId);
    }
}