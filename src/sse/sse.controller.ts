import { Body, Controller, Get, Param, Post, Sse } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { EventEmitterPayload, MessageEvent } from './sse.definition';
import { OnEvent } from '@nestjs/event-emitter';

@Controller('sse')
export class SseController {
  constructor(
    private readonly sseService: SseService,
  ) { }

  @Sse('/:topic')
  updateStats(@Param('topic') topic: string): Observable<MessageEvent> {
    return this.sseService.sendEvents(topic);
  }

  @OnEvent('topic.event.emitted')
  emitTopic(payload: EventEmitterPayload) {
    this.sseService.addEvent(payload.topic, payload.data);
  }
}
