import { randomUUID } from "node:crypto";

import type { JsonValue, Message, MessageInput } from "./types.js";
import { InvalidMessageError, InvalidPriorityError, InvalidTTLError } from "./errors.js";

const DEFAULT_PRIORITY = 0;

function deepClone(obj: JsonValue): JsonValue {
    if (obj === null || typeof obj !== "object") return obj;

    if(Array.isArray(obj)) {
        return obj.map(e => deepClone(e));
    }

    return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
            key,
            deepClone(value)
        ])
    );
}

function deepFreeze(obj: JsonValue): void {
    if (obj === null || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
        obj.forEach(e => deepFreeze(e));
    } else {
        Object.values(obj).forEach(value => deepFreeze(value));
    }

    Object.freeze(obj);
}

export function createMessage(input: MessageInput): Message {

    if (!input || typeof input !== "object") {
        throw new InvalidMessageError();
    }

    if (!("payload" in input)) {
        throw new Error("Message payload is required");
    }

    const priority = input.priority ?? DEFAULT_PRIORITY;

    if (!Number.isFinite(priority)) {
        throw new InvalidPriorityError();
    }

    if (input.ttl !== undefined) {
        if (!Number.isFinite(input.ttl) || input.ttl < 0) {
            throw new InvalidTTLError();
        }
    }

    const createdAt = Date.now();
    const state = {
        status: "pending",
        retryCount: 0,
        maxRetries: 10,
        nextRetryAt: 0,
    };

    const expiresAt =
        input.ttl !== undefined
            ? createdAt + input.ttl
            : null;

    const payload = deepClone(input.payload);
    const metadata = deepClone({ ...(input.metadata ?? {}) }) as Record<string, JsonValue>;
    
    deepFreeze(payload);
    deepFreeze(metadata);

    return Object.freeze({
        id: randomUUID(),
        payload,
        priority,
        createdAt,
        state,
        expiresAt,
        metadata
    });
}