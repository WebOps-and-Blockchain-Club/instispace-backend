import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OrderInput {
  @Field({ nullable: true })
  byLikes: boolean;

  @Field(() => Boolean, { nullable: true })
  byComments: boolean;
}
