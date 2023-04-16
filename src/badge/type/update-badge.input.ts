import {Field, InputType} from '@nestjs/graphql';

@InputType()
export class UpdateBadgeInput{
    @Field({nullable:true})
    imageURL:string;

    @Field({nullable:true})
    tier:string;

    @Field({nullable:true})
    threshold:number;
}