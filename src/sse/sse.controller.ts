import { Body, Controller, Post, Sse } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { MessageEvent } from './sse.definition';
import { OnEvent } from '@nestjs/event-emitter';

@Controller('sse')
export class SseController {
  constructor(
    private readonly sseService: SseService
  ) { }

  @Sse()
  updateStats(): Observable<MessageEvent> {
    return this.sseService.sendEvents();
  }

  @OnEvent('event.publish')
  publishEvent(payload: string | object, config: { event?: string } = {}) {
    this.sseService.addEvent({
      data: payload,
      type: config.event,
    });
  }

  @Post()
  publishMessage(@Body() payload: any) {
    this.sseService.addEvent(payload);
  }
}
