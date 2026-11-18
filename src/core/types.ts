export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
    | JsonPrimitive
    | JsonValue[]
    | { [key: string]: JsonValue };

export type MessageInput = {
    payload: JsonValue;
    priority?: number;
    ttl?: number;
    metadata?: Record<string, JsonValue>;
};

export type Message = {
    readonly id: string;
    readonly payload: JsonValue;
    readonly priority: number;
    readonly createdAt: number;
    state: MessageState;
    readonly expiresAt: number | null;
    readonly metadata: Readonly<Record<string, JsonValue>>;
};

export type MessageState = {
    status: "pending" | "processing" | "completed" | "failed" | string;
    retryCount: number;
    maxRetries: number;
    nextRetryAt: number | null;
};