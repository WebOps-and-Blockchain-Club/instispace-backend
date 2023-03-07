import { Field, ObjectType } from '@nestjs/graphql';
import { Comments } from 'src/post/comments/comment.entity';
import { Post } from 'src/post/post.entity';
import { Report } from 'src/post/reports/report.entity';
import Tag from 'src/tag/tag.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
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

  @Column({ nullable: true })
  @Field({ nullable: true })
  photo: string;

  @Field()
  department: string;

  @Field()
  programme: string;

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

  @ManyToMany((type) => Tag, (interests) => interests.users, { nullable: true })
  interests: Tag[];

  @OneToMany(() => Post, (post) => post.createdBy, { nullable: true })
  @Field(() => [Post], { nullable: true })
  post: Post[];

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

  @TreeChildren()
  accountsCreated: User[];

  @TreeParent()
  @Field({ nullable: true })
  createdBy: User;
}
