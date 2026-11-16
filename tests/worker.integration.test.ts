import { describe, it, expect } from "vitest";
import { MQ } from "../src/mq.js";

describe("Worker Integration", () => {
  it("processes messages automatically", async () => {
    const mq = new MQ();

    const producer = mq.createProducer();

    const processed: unknown[] = [];

    const worker = mq.createWorker("worker-test", async (message) => {
      processed.push(message.payload);
    });

    await producer.publish("worker-test", {
      payload: { task: "hello" },
    });

    worker.start();

    try {
      // Wait for the worker to process the message.
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("Worker timeout")),
          3000,
        );

        const check = setInterval(() => {
          if (processed.length > 0) {
            clearTimeout(timeout);
            clearInterval(check);
            resolve();
          }
        }, 25);
      });

      expect(processed).toEqual([{ task: "hello" }]);
    } finally {
      await worker.stop();
    }
  });
});