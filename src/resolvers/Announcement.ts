import Announcement from "../entities/Announcement";
import Hostel from "../entities/Hostel";
import User from "../entities/User";
import {
  CreateAnnouncementInput,
  EditAnnouncementInput,
} from "../types/inputs/announcement";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  PubSub,
  PubSubEngine,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import MyContext from "src/utils/context";
import { UserRole } from "../utils";
import addAttachments from "../utils/uploads";
import { GraphQLUpload, Upload } from "graphql-upload";

@Resolver((_type) => Announcement)
class AnnouncementResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to create Announcements, Restrictions : {Admin, Hostel Secretary, and Hostel Affair Secretary}",
  })
  @Authorized([UserRole.HAS, UserRole.HOSTEL_SEC, UserRole.ADMIN])
  async createAnnouncement(
    @PubSub() pubSub: PubSubEngine,
    @Ctx() { user }: MyContext,
    @Arg("AnnouncementInput")
    announcementInput: CreateAnnouncementInput,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      let hostels: Hostel[] = [];
      await Promise.all(
        announcementInput.hostelIds.map(async (id) => {
          const hostel = await Hostel.findOne(id);
          if (hostel) hostels.push(hostel);
        })
      );

      const announcement = new Announcement();
      announcement.title = announcementInput.title;
      announcement.description = announcementInput.description;
      announcement.user = user;
      announcement.endTime = new Date(announcementInput.endTime);
      if (images) {
        announcementInput.images = (await addAttachments(images, true)).join(
          " AND "
        );
        announcement.images = announcementInput.images;
      }
      announcement.hostels = hostels;

      await announcement.save();

      const payload = announcement;
      hostels.forEach((h) => {
        pubSub.publish(h.name, payload);
      });

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
  async getAllAnnouncements(
    @Arg("take") take: number,
    @Arg("skip") skip: number
  ) {
    try {
      const announcements = await Announcement.find({
        where: { isHidden: false },
      });
      return announcements.splice(skip, take);
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Announcement], {
    description:
      "Query to fetch announcements of a particular hostel, Restrictions : { anyone who is authorised } ",
  })
  @Authorized()
  async getAnnouncements(
    @Arg("take") take: number,
    @Arg("skip") skip: number,
    @Arg("HostelId") hostelId: string
  ) {
    try {
      let hostel = await Hostel.findOne({
        where: { id: hostelId },
        relations: ["announcements"],
      });

      const d = new Date();
      let announcements = hostel?.announcements?.filter(
        (n) =>
          new Date(n.endTime).getTime() > d.getTime() && n.isHidden === false
      );
      return announcements?.splice(skip, take);
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutataion to update Announcement, Restrictions : {Admin, Hostel Affair Secretory, Hostel Secretory}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async editAnnouncement(
    @Ctx() { user }: MyContext,
    @Arg("AnnouncementId") id: string,
    @Arg("UpdateAnnouncementInput")
    announcementInput: EditAnnouncementInput,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      const announcement = await Announcement.findOne({
        where: { id },
        relations: ["user"],
      });
      if (
        announcement &&
        (announcement.user.id === user.id ||
          user.role === UserRole.HAS ||
          user.role === UserRole.ADMIN)
      ) {
        if (images)
          announcementInput.images = (await addAttachments(images, true)).join(
            " AND "
          );
        const { affected } = await Announcement.update(id, {
          ...announcementInput,
        });
        return affected === 1;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "hide Announcement Mutation, Restrictions : {Admin, Hostel Affair Secretory and Hostel secretory }",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async deleteAnnouncement(
    @Ctx() { user }: MyContext,
    @Arg("AnnouncementId") id: string
  ) {
    try {
      const announcement = await Announcement.findOne({
        where: { id },
        relations: ["user"],
      });
      if (
        announcement &&
        (announcement.user.id === user.id ||
          user.role === UserRole.HAS ||
          user.role === UserRole.ADMIN)
      ) {
        const { affected } = await Announcement.update(id, { isHidden: true });
        return affected === 1;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Hostel)
  async hostels(@Root() { id, hostels }: Announcement) {
    try {
      if (hostels) return hostels;
      const announcement = await Announcement.findOne({
        where: { id },
        relations: ["hostels"],
      });
      return announcement?.hostels;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => User)
  async user(@Root() { id, user }: Announcement) {
    try {
      if (user) return user;
      const announcement = await Announcement.findOne({
        where: { id },
        relations: ["user"],
      });
      return announcement?.user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Subscription({ topics: ({ args }) => args.hostel }) // here you have to give hostel names
  createAnnoucementSubs(
    @Root() announcement: Announcement,
    @Arg("hostel") hostel: string
  ): Announcement {
    //TODO:  we can add and check context here but not needed I think
    console.log(hostel);
    return announcement;
  }
}

export default AnnouncementResolver;
