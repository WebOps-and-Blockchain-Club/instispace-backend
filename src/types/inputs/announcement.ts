import { Field, InputType } from "type-graphql";

@InputType({ description: "Announcement Input" })
class AnnouncementInput {
  @Field({ description: "Announcement's Title" })
  title: string;

  @Field({ description: "Announcement's Descriptions" })
  description: string;

  @Field({ description: "Announcement's Endtime" })
  endTime: string;

  image?: string;

  @Field(() => [String], { description: "Hostels' Ids" })
  hostelIds: string[];
}

export default AnnouncementInput;
