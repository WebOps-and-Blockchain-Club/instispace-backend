import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { Notification } from 'src/utils';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

registerEnumType(Notification, { name: 'Notification' });

@Entity('NotificationConfig')
@ObjectType()
export class NotificationConfig {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column('enum', { enum: Notification, default: Notification.FOLLOWED_TAGS })
  @Field((_type) => Notification, {
    description: 'Notification settings for config of Post',
  })
  configForPost: Notification;

  @Column({ type: 'boolean', nullable: true, default: true })
  @Field(() => Boolean, {
    description:
      'Do user want Notification to be sent when one likes their post',
    defaultValue: true,
  })
  configForLikeReply: Boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  @Field(() => Boolean, {
    description:
      'Do user want Notification to be sent when one comments on their query',
    defaultValue: true,
  })
  configForCommentOnQuery: boolean;

  @Column()
  @Field()
  fcmToken: string;

  @ManyToOne(() => User, (user) => user.notificationConfig, {
    cascade: true,
  })
  @Field(() => User)
  createdBy: User;
}
