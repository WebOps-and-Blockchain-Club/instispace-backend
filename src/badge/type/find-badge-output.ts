import { Field, ObjectType } from '@nestjs/graphql';
import { Badge } from '../badge.entity'

@ObjectType('getBadgeOutput')
export class getBadgeOutput{
    @Field(()=>[Badge], {nullable: true})
    list: Badge[]

    @Field(()=>Number)
    total:number;
}