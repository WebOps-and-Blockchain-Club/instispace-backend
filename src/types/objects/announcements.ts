import Announcement from "../../entities/Announcement";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getAllAnnouncementsOutput", {
  description: " Output type for getAllAnnouncements query",
})
class getAllAnnouncementsOutput {
  @Field(() => [Announcement], { nullable: true })
  announcementsList: Announcement[];

  @Field(() => Number)
  total: number;
}

@ObjectType("getAnnouncementsOutput", {
  description: "Output Type for getAnnouncements query",
})
class getAnnouncementsOutput {
  @Field(() => [Announcement], { nullable: true })
  announcementsList: Announcement[];

  @Field(() => Number)
  total: number;
}

export { getAllAnnouncementsOutput, getAnnouncementsOutput };
