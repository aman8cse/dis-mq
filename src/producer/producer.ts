import type { Message, MessageInput } from "../core/types.js";
import type { Broker } from "../broker/broker.js";

export class Producer {
  constructor(private readonly broker: Broker) {}

  async publish(
    queueName: string,
    input: MessageInput,
  ): Promise<Message> {
    return this.broker.publish(queueName, input);
  }
}