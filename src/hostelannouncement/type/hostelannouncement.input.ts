import { Field, InputType } from '@nestjs/graphql';

@InputType()
class createHostelAnnounceInput {
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

export { createHostelAnnounceInput };
