import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from './sse.definition';
import { nanoid } from 'nanoid';

@Injectable()
export class SseService {
  private event = new Subject<MessageEvent>();

  addEvent(messageEvent: MessageEvent) {
    this.event.next({
      ...messageEvent,
      id: nanoid(),
      retry: 3000,
    });
  }

  sendEvents() {
    return this.event;
  }
}
