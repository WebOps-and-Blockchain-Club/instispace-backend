import { Field, ObjectType } from '@nestjs/graphql';
import { Comments } from 'src/post/comments/comment.entity';
import { Post } from 'src/post/post.entity';
import { Report } from 'src/post/reports/report.entity';
import Tag from 'src/tag/tag.entity';
import { Club } from 'src/club/club.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { UserRole } from './type/role.enum';
import Permission from './permission/permission.entity';
import Hostel from 'src/hostel/hostel.entity';
import HostelAnnouncement from 'src/hostelAnnouncement/hostelAnnouncement.entity';
import { Notification } from 'src/utils';
import { NotifConfig } from 'src/notif-config/notif-config.entity';
import { Group } from 'src/treasure-hunt/group/group.entity';
import { Submission } from 'src/treasure-hunt/submissions/submission.entity';
import { Ticket } from 'src/ticket/ticket.entity';
import { Feedback } from 'src/course/feedback/feedback.entity';

@ObjectType()
@Entity('User')
@Tree('materialized-path')
export class User {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  ldapName: string;

  @Field()
  @Column({ unique: true })
  roll: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  forgotPassword: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  mobile?: string;

  @Field()
  @Column({ type: Boolean, default: true })
  isNewUser: Boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  notifyPost: Notification;

  @Column({ type: String, nullable: true })
  @Field((_type) => String, { nullable: true })
  fcmToken: string;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.users, { nullable: true })
  @Field((_type) => Hostel, {
    nullable: true,
    description: "User's Hostel amd its details",
  })
  hostel?: Hostel;

  @OneToMany(
    (_type) => HostelAnnouncement,
    (announcements) => announcements.user,
  )
  @Field((_type) => [HostelAnnouncement], {
    description: 'Announcements Created by User',
  })
  hostelannouncements: HostelAnnouncement[];

  @ManyToOne((_type) => Group, (group) => group.users, { nullable: true })
  @Field((_type) => Group, {
    nullable: true,
    description: 'Group of Treasure Hunt of User',
  })
  group: Group;

  @OneToMany((_type) => Submission, (submissions) => submissions.submittedBy, {
    nullable: true,
  })
  @Field((_type) => [Submission], {
    nullable: true,
    description: 'Submission of Tresure Hunt',
  })
  submissions: Submission[];

  @ManyToMany((type) => Tag, (interests) => interests.users, { nullable: true })
  interests: Tag[];

  @OneToMany(() => Post, (post) => post.createdBy, { nullable: true })
  @Field(() => [Post], { nullable: true })
  post: Post[];

  @OneToMany(() => Feedback, (Feedback) => Feedback.createdBy, { nullable: true })
  @Field(() => [Feedback], { nullable: true })
  courseFeedback: Feedback[];

  @Field()
  department: string;

  @Field()
  programme: string;

  @OneToMany(() => Post, (post) => post.approvedBy, { nullable: true })
  postsAporoved: Post[];

  @ManyToMany(() => Post, (post) => post.savedBy, { nullable: true })
  savedPost: Post[];

  @ManyToMany(() => Post, (post) => post.likedBy)
  likedPost: Post[];

  @ManyToMany(() => Post, (post) => post.dislikedBy)
  dislikedPost: Post[];

  @ManyToMany(() => Comments, (comment) => comment.likedBy)
  likedComment: Post[];

  @ManyToMany(() => Comments, (comment) => comment.dislikedBy)
  dislikedComment: Post[];

  @OneToMany(() => Comments, (comment) => comment.createdBy, { nullable: true })
  @Field(() => [Comments], { nullable: true })
  comment: Comments[];

  @OneToMany(() => Report, (report) => report.createdBy, { nullable: true })
  @Field(() => [Report], { nullable: true })
  reports: Report[];

  @ManyToOne((type) => Permission, (permission) => permission.users, {
    nullable: true,
  })
  @Field(() => Permission, { nullable: true })
  permission: Permission;

  @Column('enum', { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole, { description: "User's role" })
  role: UserRole;

  @OneToMany(() => Ticket, (ticket) => ticket.createdBy)
  @Field(() => [Ticket])
  createdTickets: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.resolvedBy)
  @Field(() => [Ticket])
  resolvedTickets: Ticket[];

  @TreeChildren()
  accountsCreated: User[];

  @OneToOne(() => Club, {
    cascade: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  club: Club;

  @ManyToMany(() => Post, (post) => post.eventAttendees, { nullable: true })
  attendedEvents: Post[];

  @Column({ nullable: true })
  @Field({ nullable: true })
  photo: string;

  @TreeParent()
  @Field({ nullable: true })
  createdBy: User;

  @OneToMany(
    () => NotifConfig,
    (notificationConfig) => notificationConfig.createdBy,
    { nullable: true },
  )
  @Field(() => [NotifConfig], { nullable: true })
  notifConfig: NotifConfig[];

  @Field(() => Boolean, { defaultValue: false, nullable: true })
  isFreshie: boolean;

  @OneToMany(() => Post, (post) => post.onBehalfOf, { nullable: true })
  @Field(() => [Post], { nullable: true })
  onBehalfOfPost: Post[]
}

