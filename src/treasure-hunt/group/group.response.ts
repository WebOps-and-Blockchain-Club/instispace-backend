import { Field, ObjectType } from "@nestjs/graphql"
import { Group } from "./group.entity"

@ObjectType()
export class FindGroupsResponse{
    @Field(() => [Group],{nullable:true})
    groupList:Group[]

    @Field()
    groupCount:number
}