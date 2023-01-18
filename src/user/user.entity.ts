import { Field, ObjectType } from '@nestjs/graphql';
import { Comments } from 'src/Post/comments/comment.entity';
import { Post } from 'src/Post/post.entity';
import { Report } from 'src/Post/reports/report.entity';
import Tag from 'src/tag/tag.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
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

  @ManyToMany(()=>Post,(post)=> post.savedBy,{nullable:true})
  savedPost:Post[]

   @ManyToMany(() => Post, (post) => post.likedBy)
  likedPost: Post[];

  @OneToMany(()=> Comments,(comment)=>comment.createdBy,{nullable:true})
  @Field(()=>[Comments],{nullable:true})
  comment:Comments

  @OneToMany(()=>Report,(report)=>report.createdBy,{nullable:true})
  @Field(()=>[Report],{nullable:true})
  reports:Report;
  
}
