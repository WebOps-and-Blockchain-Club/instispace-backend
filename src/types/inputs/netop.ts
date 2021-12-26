import { Field, InputType } from "type-graphql";

@InputType({ description: "user" })
class createNetopsInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  photo: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => Number)
  endTime: number;
}

@InputType()
class editNetopsInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  photo: string;

  @Field(() => Number)
  endTime: number;
}

export { createNetopsInput, editNetopsInput };
