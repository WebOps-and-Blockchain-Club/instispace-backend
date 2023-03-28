import { Field, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../type/role.enum';
import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../user.entity';

@Entity('Permission')
@ObjectType()
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ type: 'enum', enum: UserRole, array: true, nullable: true })
  @Field(() => [UserRole], { nullable: true })
  account: UserRole[];

  @Column({ type: 'text', array: true, nullable: true })
  @Field(() => [String], { nullable: true })
  livePosts: string[];

  @Column({ type: 'text', array: true, nullable: true })
  @Field(() => [String], { nullable: true })
  hostel: string[];

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean)
  createTag: boolean;

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean)
  createNotification: boolean;

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean)
  handleReports: boolean;

  @Column({ type: 'boolean', default: false })
  @Field(() => Boolean)
  approvePosts: Boolean;

  @OneToMany((_type) => User, (users) => users.permission)
  @Field((_type) => [User], {
    nullable: true,
  })
  users: User[];

  @Field(() => [String])
  createPost: string[];
}

export default Permission;
