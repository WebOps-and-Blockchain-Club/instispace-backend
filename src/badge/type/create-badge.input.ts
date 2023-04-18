import {Field, InputType} from '@nestjs/graphql';

@InputType()
export class CreateBadgeInput{
    @Field()
    imageURL:string;

    @Field()
    tier:string;

    @Field()
    threshold:number;
}