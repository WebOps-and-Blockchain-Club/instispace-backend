import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { NotifConfigService } from './notif-config.service';
import { NotifConfig } from './notif-config.entity';
import { CreateNotifConfigInput } from './type/create-notif-config.input';
import { UpdateNotifConfigInput } from './type/update-notif-config.input';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { User } from 'src/user/user.entity';
import { CurrentUser } from 'src/auth/current_user';

@Resolver(() => NotifConfig)
export class NotifConfigResolver {
  constructor(private readonly notifConfigService: NotifConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => NotifConfig, { nullable: true })
  createNotifConfig(
    @Args('createNotifConfigInput')
    createNotifConfigInput: CreateNotifConfigInput,
    @CurrentUser()
    user: User,
  ) {
    return this.notifConfigService.create(createNotifConfigInput, user);
  }

  @Query(() => [NotifConfig], { name: 'notifConfig' })
  findAll() {
    return this.notifConfigService.findAll();
  }

  @ResolveField(() => User)
  async createdBy(@Parent() notif: NotifConfig) {
    const notifConfig = await this.notifConfigService.findOne(notif.id);
    return notifConfig.createdBy;
  }

  @Mutation(() => NotifConfig)
  updateNotifConfig(
    @Args('updateNotifConfigInput')
    updateNotifConfigInput: UpdateNotifConfigInput,
    @Args('fcmToken')
    fcmToken: string,
  ) {
    return this.notifConfigService.update(fcmToken, updateNotifConfigInput);
  }
}
