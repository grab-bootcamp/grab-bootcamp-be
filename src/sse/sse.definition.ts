export class EventPayload {
  type: string;
  data: string | object;
}

export class EventEmitterPayload {
  topic: string;
  data: EventPayload;
}

export class MessageEvent {
  data: EventPayload;
  id?: string;
  type?: string;
  retry?: number;
}