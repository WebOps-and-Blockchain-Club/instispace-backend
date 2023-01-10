import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class CreatePostInput {

    @Field()
    title: string;
  
    @Field()
    content: string;
  
    // @Field({ nullable: true })
    // time: string;
  
    @Field({ nullable: true })
    linkName: string;
  
    @Field({ nullable: true })
    link: string;
   


    @Field({ nullable: true })
    isHidden: boolean;

    @Field()
    category: string;

    @Field({ nullable: true })
    location: string;

    @Field({ nullable: true })
    Photo: string;
}