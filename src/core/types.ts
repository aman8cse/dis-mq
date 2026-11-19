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
    retry: {
        maxRetries: number;
        backoff: {
            type: "fixed" | "exponential";
            delay: number;
            multiplier?: number;
        };
    };

    state: {
        status: MessageStatus;
        retryCount: number;
        nextRetryAt: number | null;
    };
};

export type MessageStatus = "pending" | "processing" | "completed" | "failed" | "delayed";