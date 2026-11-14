export class MQError extends Error {
    constructor(messsage: string) {
        super(messsage);
        this.name = new.target.name;
    }
}

export class InvalidMessageError extends MQError {
    constructor(message = "Invalid message input") {
        super(message);
    }
}

export class InvalidPriorityError extends MQError {
    constructor(message = "Priority must be a finite number") {
        super(message);
    }
}

export class InvalidTTLError extends MQError {
    constructor(message = "TTL must be a non-negative finite number") {
        super(message);
    }
}