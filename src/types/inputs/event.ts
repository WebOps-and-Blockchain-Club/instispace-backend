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

  @Field()
  location: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Images",
  })
  imageUrls?: string[];

  tags?: Tag[];
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

  @Field({ nullable: true })
  location: string;

  tags?: Tag[];

  @Field((_type) => [String], {
    nullable: true,
    description: "Events's Image URLs",
  })
  imageUrls?: string[];
}

export { createEventInput, editEventInput };
