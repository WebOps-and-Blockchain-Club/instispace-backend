import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import {Club} from 'src/club/club.entity'
@ObjectType()
@Entity()
export class Badge{
    @PrimaryGeneratedColumn('uuid')
    @Field()
    id:string;

    @ManyToOne(()=> Club, (club)=>club.badges, {cascade:true, onDelete : 'CASCADE', onUpdate:'CASCADE'})
    @Field(()=>Club)
    createdBy: Club;

    @Column()
    @Field()
    imageURL:string;

    @Column()
    @Field()
    tier:string;

    @Column()
    @Field()
    threshold:number;
}