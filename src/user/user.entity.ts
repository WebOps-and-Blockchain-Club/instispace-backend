import { Field, ObjectType } from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  ManyToOne,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { UserRole } from './type/role.enum';
import Permission from './permission/permission.entity';

@ObjectType()
@Entity()
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
  @Column({ type: Boolean, default: false })
  isNewUser: Boolean;

  @ManyToMany((type) => Tag, (interests) => interests.users, { nullable: true })
  interests: Tag[];

  // remove null: true
  @ManyToOne((type) => Permission, (permission) => permission.users, {
    nullable: true,
  })
  @Field(() => Permission)
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
