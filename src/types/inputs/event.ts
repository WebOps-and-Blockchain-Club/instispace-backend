import Tag from "../../entities/Tag";
import { Field, InputType } from "type-graphql";

@InputType()
class createEventInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  linkToAction: string;

  @Field(() => [String])
  tagIds: string[];

  @Field()
  time: string;

  tags?: Tag[]
  photo?: string;
  attachments?: string;
}

@InputType()
class editEventInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field(() => [String])
  tagIds: string[];

  @Field({ nullable: true })
  time: string;

  @Field({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  linkToAction: string;

  tags?: Tag[]
  photo?: string;
  attachments?: string;
}

export { createEventInput, editEventInput };
