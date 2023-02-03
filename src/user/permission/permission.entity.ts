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

  @Column({ type: 'enum', enum: UserRole, array: true })
  @Field(() => [UserRole])
  account: UserRole[];

  @Column({ type: 'text', array: true })
  @Field(() => [String])
  livePosts: string[];

  @Column({ type: 'text', array: true, nullable: true })
  @Field(() => [String])
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
}

export default Permission;
