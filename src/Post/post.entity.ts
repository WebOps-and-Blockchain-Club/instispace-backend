import { Field, ObjectType } from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';
import { User } from 'src/user/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  OneToMany,
  ManyToOne,
  JoinTable,
  UpdateDateColumn,
} from 'typeorm';
import { Comments } from './comments/comment.entity';
import { Report } from './reports/report.entity';

@ObjectType()
@Entity('Post')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  updatedAt: Date;

  @Column({ nullable: true })
  @Field({ nullable: true })
  title: string;

  @Column()
  @Field()
  content: string;

  @Column()
  @Field()
  category: string;

  @Column({ type: 'text', nullable: true })
  @Field((_type) => String, { nullable: true })
  photo?: string | null;

  @Column({ type: Boolean, default: false })
  @Field((_type) => Boolean, {
    description: 'Visiblity state of announcements',
  })
  isHidden: boolean;

  @Column({ nullable: true })
  @Field({ nullable: true })
  location: string;

  @Field(() => Number, {
    description: 'Total Number of likes for event',
    nullable: true,
  })
  likeCount: number;

  @Field(() => Boolean, {
    description: 'Event saved boolean',
    defaultValue: false,
  })
  isSaved: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  Link: string;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  endTime: Date;

  @OneToMany(() => Comments, (comment) => comment.post)
  @Field(() => [Comments], { nullable: true })
  postComments: Comments[];

  @OneToMany(() => Report, (report) => report.post, { nullable: true })
  @Field(() => [Report], { nullable: true })
  postReports: Report[];

  @ManyToOne(() => User, (user) => user.post, {
    cascade: true,
  })
  @Field(() => User)
  createdBy: User;

  @ManyToMany(() => User, (user) => user.likedPost)
  @Field(() => [User], { nullable: true })
  @JoinTable()
  likedBy: User[];

  @ManyToMany(() => User, (user) => user.savedPost, { cascade: true })
  @Field(() => [User], { nullable: true })
  @JoinTable()
  savedBy: User[];

  @ManyToMany(() => Tag, (tag) => tag.post, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @Field(() => Boolean, {
    description: 'Event is liked',
    defaultValue: false,
  })
  isLiked: boolean;
}
