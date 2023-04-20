import { Controller, Get, Sse } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { MessageEvent } from './sse.definition';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) { }

  @Sse()
  updateStats(): Observable<MessageEvent> {
    return this.sseService.sendEvents();
  }
}
