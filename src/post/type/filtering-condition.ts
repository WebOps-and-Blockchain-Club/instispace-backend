import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FilteringConditions {
  @Field({ nullable: true })
  search?: string;

  @Field(() => Boolean, { nullable: true })
  posttobeApproved: boolean;

  @Field(() => Boolean, { nullable: true })
  followedTags: boolean;

  @Field(() => Boolean, { nullable: true })
  viewReportedPosts: boolean;

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

  @Field(() => Boolean, { defaultValue: false })
  createdByMe: boolean;
}
