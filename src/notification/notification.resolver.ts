import { UseGuards } from '@nestjs/common/decorators';
import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/current_user';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { NotificationConfig } from './notification.entity';
import { NotificationService } from './notification.service';
import NotificationInput from './type/notification.input';
import { UpdateNotificationConfigInput } from './type/update-notification-config';

@Resolver(() => NotificationConfig)
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => Boolean)
  async createNotification(
    @Args('NotificationData') notificationData: NotificationInput,
  ) {
    // sending custom notification
    // await this.notificationService.customNotif(notificationData);
    return true;
  }

  @ResolveField(() => User)
  async createdBy(@Parent() notif: NotificationConfig) {
    let newPost = await this.notificationService.FindNotifByid(notif.id);
    return newPost.createdBy;
  }

  @Mutation(() => NotificationConfig)
  async updateNotifConfig(
    @Args('updateConfigInput') updateConfigInput: UpdateNotificationConfigInput,
    @Args('fcmToken') fcmToken: string,
  ) {
    return await this.notificationService.updateNotificationConfig(
      updateConfigInput,
      fcmToken,
    );
  }

  @Mutation(() => NotificationConfig)
  async createNotifConfig(
    @CurrentUser() user: User,
    @Args('fcmToken') fcmToken: string,
  ) {
    return await this.notificationService.createNotificationConfig(
      user,
      fcmToken,
    );
  }
}
