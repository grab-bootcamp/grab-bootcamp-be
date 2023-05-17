import { Body, Controller, Post } from '@nestjs/common';
import { CreateNotificationDto } from './dto';
import { NotificationService } from './notification.service';
import { OnEvent } from '@nestjs/event-emitter';

@Controller('notification')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService
  ) { }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @OnEvent('notification.publish')
  publishEvent(createNotificationDto: CreateNotificationDto) {
    this.notificationService.create(createNotificationDto);
  }
}
