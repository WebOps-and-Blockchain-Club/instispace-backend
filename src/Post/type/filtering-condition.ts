import { Field, InputType } from "@nestjs/graphql";

@InputType()
export class FilteringConditions {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tags: string[];

  @Field(() => Boolean, { nullable: true })
  isStared: boolean;
}
