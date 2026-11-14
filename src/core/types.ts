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
    readonly expiresAt: number | null;
    readonly metadata: Readonly<Record<string, JsonValue>>;
};

export type MessageState = {
    retryCount: number;
    status: "pending" | "processing" | "acknowledged" | "failed";
};