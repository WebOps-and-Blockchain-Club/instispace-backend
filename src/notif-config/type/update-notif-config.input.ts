import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateNotifConfigInput {
  @Field(() => [String], { nullable: true })
  forAllPost: string[];

  @Field(() => [String], { nullable: true })
  nonePost: string[];

  @Field(() => [String], { nullable: true })
  followedTagsPost: string[];
}
