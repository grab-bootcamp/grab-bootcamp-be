import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from './sse.definition';
import { nanoid } from 'nanoid';

@Injectable()
export class SseService {
  private events = new Subject<MessageEvent>();

  addEvent(messageEvent: MessageEvent) {
    this.events.next({
      ...messageEvent,
      id: nanoid(),
      retry: 3000,
    });
  }

  sendEvents() {
    return this.events;
  }
}
