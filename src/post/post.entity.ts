import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
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
  Index,
} from 'typeorm';
import { Comments } from './comments/comment.entity';
import { Report } from './reports/report.entity';
import { PostStatus } from './type/postStatus.enum';
registerEnumType(PostStatus, { name: 'PostStatus' });

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
  @Index()
  @Field()
  category: string;
 
  @Field({ nullable: true})
  attachment: string;

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

  @Column('enum', { enum: PostStatus, default: PostStatus.POSTED })
  @Field((_type) => PostStatus, {
    description: 'Visiblity state of reports',
  })
  status: PostStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  Link: string;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  endTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  @Field(() => Date, { nullable: true })
  postTime: Date;

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

  @ManyToOne(() => User, (user) => user.postsAporoved, { nullable: true })
  approvedBy: User;

  @ManyToMany(() => User, (user) => user.likedPost)
  @Field(() => [User], { nullable: true })
  @JoinTable()
  likedBy: User[];

  @ManyToMany(() => User, (user) => user.savedPost, { cascade: true })
  @Field(() => [User], { nullable: true })
  @JoinTable()
  savedBy: User[];

  @ManyToMany(() => Tag, (tag) => tag.post, { cascade: true, nullable: true })
  @JoinTable()
  tags: Tag[];

  @Field(() => Boolean, {
    description: 'Event is liked',
    defaultValue: false,
  })
  isLiked: boolean;

  @Field(() => Boolean)
  isReported: Boolean;

  @Field(() => Number)
  reportCount: Number;

  @Field(() => Number)
  dislikeCount: Number;

  @Field(() => Boolean)
  isDisliked: Boolean;

  @ManyToMany(() => User, (user) => user.dislikedPost)
  @Field(() => [User], { nullable: true })
  @JoinTable()
  dislikedBy: User[];

  @Field(() => [String])
  permissions: string[];

  @Field(() => [String])
  actions: string[];

  @Column({nullable:true})
  @Field(()=> Boolean, {nullable:true})
  isQRActive:Boolean;

  @Column({nullable:true})
  @Field({nullable:true})
  qrText:string;

  @Column({nullable:true})
  @Field(()=>Number, {nullable:true})
  pointsValue: Number;

  @ManyToMany(()=> User, (user)=>user.attendedEvents)
  @Field(()=> [User], {nullable:true})
  @JoinTable()
  eventAttendees: User[];
}
