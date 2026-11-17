import type { Broker } from "../broker/broker.js";

export class Consumer {
  constructor(
    private readonly broker: Broker,
    private readonly queueName: string,
  ) { }

  async consume() {
    return this.broker.consume(this.queueName);
  }

  async ack(messageId: string) {
    this.broker.ack(this.queueName, messageId);
  }

  async noAck(messageId: string) {
    this.broker.noAck(this.queueName, messageId);
  }
}