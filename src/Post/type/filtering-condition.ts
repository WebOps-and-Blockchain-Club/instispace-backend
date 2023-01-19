import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FilteringConditions {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tags: string[];

  @Field(() => Boolean, { defaultValue: false })
  isSaved: boolean;

  @Field(() => [String], { nullable: true })
  categories: string[];

  @Field(() => Boolean, { defaultValue: false })
  isLiked: boolean;

  @Field(() => Boolean, { defaultValue: false })
  showOldPost: boolean;
}
