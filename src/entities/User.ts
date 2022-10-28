import { UserPermission, UserRole } from "../utils";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
  OneToOne,
} from "typeorm";
import Netop from "./Netop";
import Event from "./Event";
import Comment from "./Common/Comment";
import Tag from "./Tag";
import Hostel from "./Hostel";
import Item from "./Item";
import Announcement from "./Announcement";
import Report from "./Common/Report";
import Query from "./MyQuery";
import Complaint from "./Complaint";
import { Notification } from "../utils/index";
import Feedback from "./Feedback";
import Group from "./tresure_hunt/Group";
import Submission from "./tresure_hunt/Submission";

@Entity("User")
@ObjectType("User", { description: "User Entity" })
class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Unique uuid generated for each User" })
  id: string;

  @Column({ unique: true })
  @Field({ description: "Users Email(for Admin)/Roll-Number(for ldpap User)" })
  roll: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "User's name" })
  name: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "username in ldap" })
  ldapName: string;

  @Column({ nullable: true })
  password: string;

  @Column("enum", { enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole, { description: "User's role" })
  role: UserRole;

  //Notifications
  @Column("enum", { enum: Notification, default: Notification.FOLLOWED_TAGS })
  @Field(() => Notification)
  notifyNetop: Notification;

  @Column("enum", { enum: Notification, default: Notification.FOLLOWED_TAGS })
  @Field(() => Notification)
  notifyEvent: Notification;

  @Column("boolean", { default: true })
  @Field(() => Boolean)
  notifyMyQuery: boolean;

  @Column("boolean", { default: false })
  @Field(() => Boolean)
  notifyFound: boolean;

  @Column("boolean", { default: true })
  @Field(() => Boolean)
  notifyNetopComment: boolean;

  @Column("boolean", { default: true })
  @Field(() => Boolean)
  notifyMyQueryComment: boolean;

  // networking and opportunity
  @OneToMany(() => Netop, (netop) => netop.createdBy)
  networkingAndOpportunities: Netop[];

  @OneToMany(() => Event, (event) => event.createdBy)
  event: Event[];

  @OneToMany((_type) => Announcement, (announcements) => announcements.user)
  @Field((_type) => [Announcement], {
    description:
      "Announcements Created by User, can only be created if its a Super User",
  })
  announcements: Announcement[];

  @OneToMany(() => Query, (query) => query.createdBy)
  querys: Query[];

  @ManyToMany(() => Netop, (netop) => netop.likedBy)
  likedNetop: Netop[];

  @ManyToMany(() => Event, (event) => event.likedBy)
  likedEvent: Event[];

  @ManyToMany(() => Query, (query) => query.likedBy)
  likedMyQuery: Query[];

  @OneToMany(() => Netop, (netop) => netop.staredBy)
  staredNetop: Netop[];

  @OneToMany(() => Event, (event) => event.staredBy)
  staredEvent: Event[];

  @OneToMany(() => Comment, (comment) => comment.createdBy)
  comments: Comment[];

  @OneToMany(() => Report, (report) => report.createdBy)
  reports: Report[];

  @Column({ nullable: true })
  @Field({ nullable: true, description: "LDAP User's Phone number" })
  mobile?: string;

  @Column({ type: Boolean })
  @Field((_type) => Boolean, {
    description: "This Field determines if User is a new User or not!",
  })
  isNewUser: Boolean;

  @Column({ type: String, nullable: true })
  @Field((_type) => String)
  fcmToken: string;

  @ManyToMany((_type) => Tag, (interest) => interest.users, { nullable: true })
  @Field((_type) => [Tag], {
    nullable: true,
    description: "User's Interest, collection of Tags",
  })
  interest?: Tag[];

  @ManyToOne((_type) => Hostel, (hostel) => hostel.users, { nullable: true })
  @Field({ nullable: true, description: "User's Hostel amd its details" })
  hostel?: Hostel;

  @OneToMany((_type) => Item, (items) => items.user, { nullable: true })
  @Field((_type) => [Item], {
    nullable: true,
    description: "User's Lost and Found Items",
  })
  items?: Item[];

  @OneToMany((_type) => Complaint, (complaints) => complaints.user, {
    nullable: true,
  })
  @Field((_type) => [Complaint], { nullable: true })
  complaints?: Complaint[];

  @ManyToMany(
    (_type) => Complaint,
    (complaintsUpvoted) => complaintsUpvoted.user,
    { nullable: true }
  )
  @JoinTable()
  @Field((_type) => [Complaint], { nullable: true })
  complaintsUpvoted?: Complaint[];

  @OneToMany((__type) => Feedback, (feedbacks) => feedbacks.user, {
    nullable: true,
  })
  @Field((__type) => [Feedback], {
    nullable: true,
    description: "feedbacks of the user",
  })
  feedbacks?: Feedback[];

  @ManyToOne((_type) => Group, (group) => group.users, { nullable: true })
  @Field((_type) => Group, {
    nullable: true,
    description: "Group of Treasure Hunt of User",
  })
  group: Group;

  @OneToOne((_type) => Group, (groupCreated) => groupCreated.createdBy, {
    nullable: true,
  })
  @Field((_type) => Group, {
    nullable: true,
    description: "Group Created By Treasure Hunt User",
  })
  groupCreated: Group;

  @OneToMany((_type) => Submission, (submissions) => submissions.submittedBy, {
    nullable: true,
  })
  @Field((_type) => [Submission], {
    nullable: true,
    description: "Submission of Tresure Hunt",
  })
  submissions: Submission[];

  @Field(() => [UserPermission], { nullable: true })
  permissions: UserPermission[];

  @Field()
  program: string;

  @Field()
  department: string;
}

export default User;
