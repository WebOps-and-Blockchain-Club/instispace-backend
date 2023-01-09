import { Field, ObjectType } from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  ManyToMany,
} from 'typeorm';

@ObjectType()
@Entity()
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
}
