import { Field, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany, OneToMany } from 'typeorm';
import { Comments } from './comments/comment.entity';
import { Report } from './reports/report.entity';

@ObjectType()
@Entity("Post")
export class Post {
    @PrimaryGeneratedColumn("uuid")
    @Field()
    id: string;
  
    @CreateDateColumn({ type: "timestamptz" })
    @Field(() => Date)
    createdAt: Date;
  
    @Column()
    @Field()
    title: string;
  
    @Column()
    @Field()
    content: string;

    @Column()
    @Field()
    category: string;
  
  
    @Column({ type: "text", nullable: true })
    @Field((_type) => String, { nullable: true })
    photo?: string | null;
  
    @Column({ type: Boolean, default: false })
    @Field((_type) => Boolean, {
      description: "Visiblity state of announcements",
    })
    isHidden: boolean;
  
    @Column({nullable:true})
    @Field({nullable:true})
    location: string;
  
    // @Column({ nullable: true })
    // @Field(() => Number, { description: "Total Number of likes for event" })
    // likeCount: number;
  
    // @Column({ nullable: true })
    // @Field(() => Boolean, { description: "Event starred boolean" })
    // isStared: boolean;
  
    @Field({ nullable: true })
    @Column({ nullable: true })
    linkName: string;
  
    @Field({ nullable: true })
    @Column({ nullable: true })
    Link: string;

    // @Column({ type: "timestamptz" })
    // @Field(() => Date)
    // time: Date;
    @OneToMany(()=>Comments,comment=>comment.post)
    @Field(()=>[Comments],{nullable:true})
    postComments:Comments[];

    @OneToMany(()=>Report,report=>report.post)
    @Field(()=>[Report],{nullable:true})
    postReports:Report[];
}
