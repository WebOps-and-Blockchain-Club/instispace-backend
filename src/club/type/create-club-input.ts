import { InputType, Field } from "@nestjs/graphql";
import {Badge} from 'src/badge/badge.entity';
@InputType()
export class CreateClubInput{
    @Field()
    clubName:string;

    @Field()
    logo:string;
}
