import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import NotificationInput from './type/notification.input';

@Resolver()
export class NotificationResolver {
  constructor(private readonly notificationService: NotificationService) {}
  @Mutation(() => Boolean)
  async createNotification(
    @Args('NotificationData') notificationData: NotificationInput,
  ) {
    await this.notificationService.customNotif(notificationData);
    return true;
  }
}
