import { describe, it, expect } from "vitest";
import { MQ } from "../src/mq.js";

describe("MQ Redis Integration", () => {
  const mq = new MQ();
  const producer = mq.createProducer();
  const consumer = mq.createConsumer("test-queue");

  it("publishes and consumes a message", async () => {
    const published = await producer.publish("test-queue", {
      payload: { hello: "world" },
      priority: 5,
    });

    const consumed = await consumer.consume();

    expect(consumed?.id).toBe(published.id);
    expect(consumed?.payload).toEqual({ hello: "world" });
  });

  it("respects priority", async () => {
    await producer.publish("priority-test", {
      payload: { order: 1 },
      priority: 1,
    });

    await producer.publish("priority-test", {
      payload: { order: 2 },
      priority: 10,
    });

    const consumer = mq.createConsumer("priority-test");

    const first = await consumer.consume();

    expect(first?.payload).toEqual({ order: 2 });
  });
});