import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from 'src/Post/post.entity';
import Tag from 'src/tag/tag.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Generated,
  ManyToMany,
  OneToMany,
  JoinTable,
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

  @OneToMany(() => Post, (post) => post.createdBy,{nullable:true})
  @Field(()=>[Post],{nullable:true})
  post:Post[];

  @OneToMany(()=>Post,(post)=> post.savedBy,{nullable:true})
  savedEvent:Post[]

   @ManyToMany(() => Post, (post) => post.likedBy)
  likedPost: Post[];
}
