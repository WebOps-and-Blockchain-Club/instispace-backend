import { Field, InputType } from '@nestjs/graphql';
import { Notification } from 'src/utils';

@InputType()
export class UpdateNotificationConfigInput {
  @Field(() => Notification, {
    description: 'Notification settings for config of Post',
    nullable: true,
  })
  configForPost: Notification;

  @Field(() => Boolean, {
    description:
      'Do user want Notification to be sent when one likes their post',
    defaultValue: true,
  })
  configForLikeReply: Boolean;

  @Field(() => Boolean, {
    description:
      'Do user want Notification to be sent when one comments on their query',
    defaultValue: true,
  })
  configForCommentOnQuery: boolean;
}
