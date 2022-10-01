import { Field, InputType } from "type-graphql";

@InputType({ description: "user" })
class CreateNetopsInput {
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

  @Field((_type) => [String], {
    nullable: true,
    description: "Attachments for a Post",
  })
  attachmentUrls?: string[];
}

@InputType()
class EditNetopsInput {
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

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Image URLs",
  })
  attachmentUrls: string[];
}

@InputType()
class ReportPostInput {
  @Field()
  description: string;
}

@InputType()
class FilteringConditions {
  @Field({ nullable: true })
  search?: string;

  @Field(() => [String], { nullable: true })
  tags: string[];

  @Field(() => Boolean, { nullable: true })
  isStared: boolean;
}

@InputType()
class OrderInput {
  @Field({ nullable: true })
  byLikes: boolean;

  @Field(() => Boolean, { nullable: true })
  stared: boolean;

  @Field(() => Boolean, { nullable: true })
  byComments: boolean;
}

export {
  CreateNetopsInput,
  EditNetopsInput,
  FilteringConditions,
  ReportPostInput,
  OrderInput,
};
