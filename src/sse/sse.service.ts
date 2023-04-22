import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { EventPayload, MessageEvent } from './sse.definition';
import { nanoid } from 'nanoid';

interface IEventTopic {
  [key: string]: Subject<MessageEvent>;
}

@Injectable()
export class SseService {
  private events: IEventTopic = {};

  createEventTopic(topic: string) {
    if (!this.events[topic] || this.events[topic].closed) {
      this.events[topic] = new Subject<MessageEvent>();
    }
  }

  addEvent(topic: string, data: EventPayload) {
    this.events[topic]?.next({
      data,
      id: nanoid(),
    });
  }

  sendEvents(topic: string) {
    this.createEventTopic(topic);
    return this.events[topic];
  }
}
