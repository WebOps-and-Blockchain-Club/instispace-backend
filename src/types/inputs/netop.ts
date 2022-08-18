import { Field, InputType } from "type-graphql";

@InputType({ description: "user" })
class createNetopsInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  linkToAction: string;

  @Field(() => [String])
  tags: string[];

  @Field()
  endTime: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Images",
  })
  imageUrls?: string[];

  attachments?: string;
}

@InputType()
class editNetopsInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field(() => [String])
  tagIds: string[];

  @Field({ nullable: true })
  endTime: string;

  @Field({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  linkToAction: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Image URLs",
  })
  imageUrls: string[];

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
