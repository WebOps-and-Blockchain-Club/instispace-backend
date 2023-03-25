import { Field, ObjectType } from '@nestjs/graphql';
import { Club } from '../club.entity'

@ObjectType('getClubOutput')
export class getClubOutput{
    @Field(()=>[Club], {nullable: true})
    list: Club[];

    @Field(()=>Number)
    total:number;
}