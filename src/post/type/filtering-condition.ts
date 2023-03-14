import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FilteringConditions {
  @Field({ nullable: true })
  search?: string;

  @Field({ nullable: true })
  posttobeApproved: boolean;

  @Field({ nullable: true })
  viewReportedPosts: boolean;

   @Field(() => Boolean, { nullable: true })
  followedTags: boolean;

 @Field(() => Boolean, { defaultValue: false })
  createdByMe: boolean;

  @Field({
    description: 'filters the post based on created by id provided to it.',
    nullable: true,
  })
  createBy: string;

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
