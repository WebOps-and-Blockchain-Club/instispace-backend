import { InputType, Field } from "@nestjs/graphql";
import { CreateBadgeInput } from "./create-badge.input";
import { Badge } from "../badge.entity";

@InputType()
export class CreateBadgesInput{
    @Field(()=>[CreateBadgeInput])
    badges: CreateBadgeInput[];
}