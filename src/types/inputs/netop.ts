import { Field, InputType } from "type-graphql";

@InputType({ description: "user" })
class createNetopsInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  endTime: string;

  photo?: string;
  attachments?: string;
}

@InputType()
class editNetopsInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  endTime: string;

  photo?: string;
  attachments?: string;
}

@InputType()
class fileringConditions {
  @Field(() => [String], { nullable: true })
  tags: string[];

  @Field(() => Boolean, { nullable: true })
  isStared: boolean;
}

export { createNetopsInput, editNetopsInput, fileringConditions };
