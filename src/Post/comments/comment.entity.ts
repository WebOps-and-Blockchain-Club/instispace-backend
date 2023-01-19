import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Post } from 'src/Post/post.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Report } from '../reports/report.entity';

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
}
