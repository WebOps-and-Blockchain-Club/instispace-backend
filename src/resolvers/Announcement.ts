import Announcement from "../entities/Announcement";
import Hostel from "../entities/Hostel";
import User from "../entities/User";
import AnnouncementInput from "../types/inputs/announcement";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import MyContext from "src/utils/context";
import { UserRole } from "../utils";
 
@Resolver((_type) => Announcement)
class AnnouncementResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to create Announcements, Restrictions : {Admin, Hostel Secretary, and Hostel Affair Secretary}",
  })
  @Authorized(["HAS", "HOSTEL_SEC", "ADMIN"])
  async createAnnouncement(
    @Ctx() { user }: MyContext,
    @Arg("AnnouncementInput")
    announcementInput: AnnouncementInput,
  ) {
    try {
      const announcement = new Announcement();
      announcement.title = announcementInput.title;
      announcement.description = announcementInput.description;
      announcement.user = user;
      announcement.endTime = announcementInput.endTime;
      announcement.image = announcementInput.image;
      const hostel = await Hostel.findOne({ where: { id: announcementInput.hostelId }, relations : ["announcements"] });
      if(!hostel) throw new Error("Invalid hostel Id");
      announcement.hostel = hostel;
      await announcement.save();
      return !!announcement;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Announcement], {
    description:
      "Query to fetch announcements of each hostel, Restrictions : { Admin, Hostel Affair Secretory} ",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS])
  async getAllAnnouncements() {
    try {
      return await Announcement.find();
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Announcement], {
    description:
      "Query to fetch announcements of a particular hostel, Restrictions : { anyone who is authorised } ",
  })
  @Authorized()
  async getAnnouncements(@Arg("HostelId") hostelId: string) {
    try {
      let announcements = await Announcement.find({
        where: { hostel: hostelId},
      });
      //announcements = announcements.filter((n) => n.endTime < Date.now());
      return announcements;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutataion to update Announcement, Restrictions : {Admin, Hostel Affair Secretory, Hostel Secretory}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async updateAnnouncement(
    @Ctx() { user }: MyContext,
    @Arg("UpdateAnnouncementInput")
    announcementInput : AnnouncementInput,
    @Arg("AnnouncementId") id: string,
  ) {
    try {
      const announcement = await Announcement.findOne({where: {id}, relations : ["user"]});
      if(announcement && announcement.user.id === user.id){
        const { affected } = await Announcement.update(id, {...announcementInput});
        return !!affected;
      }
      console.log("Announcement");
      return !!announcement;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Hostel)
  async hostel(@Root() { id }: Announcement) {
    try {
      const announcement = await Announcement.findOne({
        where: { id },
        relations: ["hostel"],
      });
      return announcement?.hostel;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => User)
  async user(@Root() { id }: Announcement) {
    try {
      const announcement = await Announcement.findOne({
        where: { id },
        relations: ["user"],
      });
      return announcement?.user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default AnnouncementResolver;
