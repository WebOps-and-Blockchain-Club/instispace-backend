import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import{Badge} from 'src/badge/badge.entity'
import {User} from 'src/user/user.entity'
@ObjectType()
@Entity()
export class Club{
    @PrimaryGeneratedColumn('uuid')
    @Field()
    clubId:string;

    @Column()
    @Field()
    clubName:string;

    @Column({nullable:true})
    @Field({nullable:true})
    logo:string;

    @OneToMany(()=>Badge, (badge)=>badge.createdBy, {nullable:true})
    @Field(()=> [Badge], {nullable:true})
    badges:Badge[];
}
