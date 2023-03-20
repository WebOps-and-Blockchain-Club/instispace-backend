import { ObjectType, Field, Int } from '@nestjs/graphql';
import { PostCategory } from 'src/post/type/post-category.enum';
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('NotificationConfig')
export class NotifConfig {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  fcmToken: string;

  @Column({
    nullable: true,
    type: 'text',
    array: true,
    default: [
      PostCategory.Announcement,
      PostCategory.Competition,
      PostCategory.Recruitment,
      PostCategory.Event,
    ],
  })
  @Field(() => [String], {
    nullable: true,
    defaultValue: [
      PostCategory.Announcement,
      PostCategory.Competition,
      PostCategory.Recruitment,
      PostCategory.Event,
    ],
  })
  forAllPost: string[];

  @Column({
    nullable: true,
    type: 'text',
    array: true,
    default: [
      PostCategory.Help,
      PostCategory.RandomThought,
      PostCategory.Lost,
      PostCategory.Found,
    ],
  })
  @Field(() => [String], {
    nullable: true,
    defaultValue: [
      PostCategory.Help,
      PostCategory.RandomThought,
      PostCategory.Lost,
      PostCategory.Found,
    ],
  })
  nonePost: string[];

  @Column({
    nullable: true,
    type: 'text',
    array: true,
    default: [
      PostCategory.Opportunity,
      PostCategory.Connect,
      PostCategory.Query,
      PostCategory.Review,
    ],
  })
  @Field(() => [String], {
    nullable: true,
    defaultValue: [
      PostCategory.Opportunity,
      PostCategory.Connect,
      PostCategory.Query,
      PostCategory.Review,
    ],
  })
  followedTagsPost: string[];

  @Column({ type: 'boolean', nullable: true, default: true })
  @Field(() => Boolean, {
    description:
      'Do user want Notification to be sent when one likes their post',
    defaultValue: true,
  })
  LikeReply: Boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  @Field(() => Boolean, {
    description:
      'Do user want Notification to be sent when one comments on their query',
    defaultValue: true,
  })
  CommentOnQuery: boolean;

  @ManyToOne(() => User, (user) => user.notifConfig, {
    cascade: true,
  })
  @Field(() => User)
  createdBy: User;
}
