import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async find(cursor: number, size: number) {
    const onCursorArgs = {}
    if (cursor) {
      onCursorArgs['cursor'] = {
        mId: cursor
      }
      onCursorArgs['skip'] = 1
    }
    return this.prisma.notification.findMany({
      ...onCursorArgs,
      take: size,
      orderBy: {
        mCreatedAt: 'desc'
      }
    });
  }

  async create(data: CreateNotificationDto) {
    const createdNotification = await this.prisma.notification.create({
      data
    });

    this.eventEmitter.emit('event.publish', createdNotification, {
      event: 'notification'
    });

    return createdNotification;
  }
}
