import { Args, Query, Resolver } from '@nestjs/graphql';
import { Notification } from './entities';
import { NotificationService } from './notification.service';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService
  ) { }

  @Query(() => [Notification], { name: 'notification' })
  find(
    @Args('cursor', { nullable: true, defaultValue: null }) cursor: number,
    @Args('size', { defaultValue: 10 }) size: number,
  ) {
    return this.notificationService.find(cursor, size);
  }
}
