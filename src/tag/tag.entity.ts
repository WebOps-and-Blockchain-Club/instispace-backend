
import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/Post/post.entity';
import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('Tag')
@ObjectType('Tag')
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

  @ManyToMany(() => Post,(post) => post.tags)
  @JoinTable()
  post:Post[];
  
}

export default Tag;
