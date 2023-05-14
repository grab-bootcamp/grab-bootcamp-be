import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationController } from './notification.controller';

@Module({
  providers: [NotificationService, NotificationResolver],
  controllers: [NotificationController]
})
export class NotificationModule {}
