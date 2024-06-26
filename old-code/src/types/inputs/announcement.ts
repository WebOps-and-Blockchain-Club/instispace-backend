import { Field, InputType } from "type-graphql";

@InputType({ description: "Announcement Input" })
class CreateAnnouncementInput {
  @Field({ description: "Announcement's Title" })
  title: string;

  @Field({ description: "Announcement's Descriptions" })
  description: string;

  @Field({ description: "Announcement's Endtime" })
  endTime: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Images",
  })
  imageUrls?: string[];

  @Field(() => [String], { description: "Hostels' Ids" })
  hostelIds: string[];
}

@InputType({ description: "Announcement Input" })
class EditAnnouncementInput {
  @Field({ nullable: true, description: "Announcement's Title" })
  title?: string;

  @Field({ nullable: true, description: "Announcement's Descriptions" })
  description?: string;

  @Field({ nullable: true, description: "Announcement's Endtime" })
  endTime?: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Image URLs",
  })
  imageUrls?: string[];

  @Field(() => [String], { nullable: true, description: "Hostels' Ids" })
  hostelIds?: string[];
}

export { CreateAnnouncementInput, EditAnnouncementInput };
