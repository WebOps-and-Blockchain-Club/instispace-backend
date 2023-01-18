import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
  Tree,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
@ObjectType()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ unique: true })
  @Field()
  title: string;

  @Column()
  @Field()
  category: string;

  @ManyToMany((_type) => User, (users) => users.interests, { cascade: true })
  @JoinTable()
  @Field((_type) => [User], {
    nullable: true,
  })
  users: User[];
}

export default Tag;
