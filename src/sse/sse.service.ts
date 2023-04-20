import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { MessageEvent } from './sse.definition';
import { nanoid } from 'nanoid';

@Injectable()
export class SseService {
  private events = new Subject<MessageEvent>();

  addEvent(data: string | object) {
    this.events.next({
      data,
      id: nanoid(),
    });
  }

  sendEvents() {
    return this.events;
  }
}
