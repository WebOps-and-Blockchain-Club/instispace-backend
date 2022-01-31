import { Field, InputType } from "type-graphql";

@InputType({ description: "user" })
class createQuerysInput {
  @Field()
  title: string;

  @Field()
  content: string;

  photo?: string;
  attachments?: string;
}

@InputType()
class editQuerysInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  photo?: string;
  attachments?: string;
}

export { createQuerysInput, editQuerysInput };
