import { Storage } from "./storage/storage.js";
import { Broker } from "./broker/broker.js";
import { Producer } from "./producer/producer.js";
import { Consumer } from "./consumer/consumer.js";
import  { Worker, type MessageHandler } from "./worker/worker.js";

export class MQ {
  private readonly storage: Storage;
  private readonly broker: Broker;

  constructor() {
    this.storage = new Storage();
    this.broker = new Broker(this.storage);
  }

  createProducer(): Producer {
    return new Producer(this.broker);
  }

  createConsumer(queueName: string): Consumer {
    return new Consumer(this.broker, queueName);
  }

  createWorker(queueName: string, handler: MessageHandler): Worker {
    const consumer = this.createConsumer(queueName);
    return new Worker(consumer, handler);
  }
}