import { Field, InputType } from "type-graphql";

@InputType()
class createNetopsInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  photo: string;

  @Field(() => [String])
  tags: string[];
}

@InputType()
class editNetopsInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  photo: string;

  @Field(() => [String], { nullable: true })
  tags: string[];
}

export { createNetopsInput, editNetopsInput };
