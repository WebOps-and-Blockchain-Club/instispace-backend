import { Field, InputType } from "type-graphql";

@InputType({ description: "user" })
class createQuerysInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Images",
  })
  imageUrls?: string[];

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Images",
  })
  attachmentUrls?: string[];
}

@InputType()
class editQuerysInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Image URLs",
  })
  imageUrls: string[];

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Image URLs",
  })
  attachmentUrls?: string;
}

export { createQuerysInput, editQuerysInput };
