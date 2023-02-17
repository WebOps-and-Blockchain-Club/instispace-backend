import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from '../reports/report.entity';
import { PostStatus } from '../type/postStatus.enum';

@Entity('Comment')
@ObjectType()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  content: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  createdAt: Date;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: 'Visiblity state of announcements',
  })
  isHidden: boolean;

  @ManyToOne(() => Post, (post) => post.postComments)
  @Field(() => Post)
  post: Post;

  @OneToMany(() => Report, (report) => report.comment)
  @Field(() => [Report], { nullable: true })
  commentReports: Report[];

  @ManyToOne(() => User, (user) => user.comment)
  @Field(() => User)
  createdBy: User;

  @Column('enum', { enum: PostStatus, default: PostStatus.POSTED })
  @Field((_type) => PostStatus, {
    description: 'Visiblity state of reports',
  })
  status: PostStatus;

  @Column({ type: 'text', nullable: true })
  @Field((_type) => String, { nullable: true })
  photo?: string | null;

  @Field(() => Boolean)
  isReported: Boolean;

  @Field(() => Number)
  reportCount: Number;

  @ManyToMany(() => User, (user) => user.likedComment)
  @Field(() => [User], { nullable: true })
  @JoinTable()
  likedBy: User[];

  @Field(() => Number, {
    description: 'Total Number of likes for event',
    nullable: true,
  })
  likeCount: number;

  @Field(() => Boolean, {
    description: 'Event is liked',
    defaultValue: false,
  })
  isLiked: boolean;

  @ManyToMany(() => User, (user) => user.dislikedComment)
  @Field(() => [User], { nullable: true })
  @JoinTable()
  dislikedBy: User[];

  @Field(() => Number)
  dislikeCount: Number;

  @Field(() => Boolean)
  isDisliked: Boolean;
}
