import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comments } from '../comments/comment.entity';
import { Post } from '../post.entity';

@Entity('Report')
@ObjectType()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  description: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.postReports)
  @Field(() => Post, { nullable: true })
  post: Post;

  @ManyToOne(() => Comments, (comment) => comment.commentReports)
  @Field(() => Comments, { nullable: true })
  comment: Comments;

  @ManyToOne(() => User, (user) => user.reports)
  @Field(() => User, { nullable: true })
  createdBy: User;
}
