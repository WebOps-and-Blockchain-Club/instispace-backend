import { InputType, Field } from "@nestjs/graphql";
import {Badge} from 'src/badge/badge.entity';
@InputType()
export class UpdateClubInput{
    @Field({nullable:true})
    clubName:string;

    @Field({nullable:true})
    logo:string;
}
