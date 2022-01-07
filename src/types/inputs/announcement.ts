import { Field, InputType } from "type-graphql";

@InputType({ description: "Announcement Input" })
class AnnouncementInput {
  @Field({ description: "Announcement's Title" })
  title: string;

  @Field({ description: "Announcement's Descriptions" })
  description: string;

  @Field((_type) => Number, { description: "Announcement's Endtime" })
  endTime: number;

  @Field({ description: "Announcement's Image description", nullable: true })
  image?: string;

  @Field({ description: "Hostel's Id" })
  hostelIds: string[];
}

export default AnnouncementInput;
