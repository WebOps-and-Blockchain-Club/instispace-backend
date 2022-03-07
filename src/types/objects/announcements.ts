import Announcement from "../../entities/Announcement";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getAnnouncementsOutput", {
  description: "Output Type for getAnnouncements query",
})
class getAnnouncementsOutput {
  @Field(() => [Announcement], { nullable: true })
  announcementsList: Announcement[];

  @Field(() => Number)
  total: number;
}

export { getAnnouncementsOutput };
