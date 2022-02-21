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
import {
  getAllAnnouncementsOutput,
  getAnnouncementsOutput,
} from "../types/objects/announcements";
import { Like } from "typeorm";

@Resolver((_type) => Announcement)
class AnnouncementResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to create Announcements, Restrictions : {Admin, Hostel Secretary, and Hostel Affair Secretary}",
  })
  @Authorized([
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
    UserRole.ADMIN,
    UserRole.SECRETORY,
  ])
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

      const announcementCreated = await announcement.save();

      const payload = announcement;
      hostels.forEach((h) => {
        pubSub.publish(h.name, payload);
      });

      return !!announcementCreated;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => getAllAnnouncementsOutput, {
    description:
      "Query to fetch announcements of each hostel, Restrictions : { Admin, Hostel Affair Secretory} ",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.SECRETORY])
  async getAllAnnouncements(
    @Arg("LastAnnouncementId") lastAnnouncementId: string,
    @Arg("take") take: number,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      let announcements = await Announcement.find({
        where: { isHidden: false },
        order: { createdAt: "DESC" },
      });
      const total = announcements.length;
      var announcementsList: Announcement[] = [];
      if (search) {
        await Promise.all(
          ["title"].map(async (field: string) => {
            const filter = { [field]: Like(`%${search}%`) };
            const announcementF = await Announcement.find({
              where: filter,
              order: { createdAt: "DESC" },
            });
            announcementF.forEach((ann) => {
              announcementsList.push(ann);
            });
          })
        );
        const annStr = announcementsList.map((obj) => JSON.stringify(obj));
        const uniqueAnnStr = new Set(annStr);
        announcements = Array.from(uniqueAnnStr).map((str) => JSON.parse(str));
      }
      if (lastAnnouncementId) {
        const index = announcements
          .map((n) => n.id)
          .indexOf(lastAnnouncementId);
        announcementsList = announcements.splice(index + 1, take);
      } else {
        announcementsList = announcements;
      }
      return { announcementsList: announcementsList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => getAnnouncementsOutput, {
    description:
      "Query to fetch announcements of a particular hostel, Restrictions : { anyone who is authorised } ",
  })
  @Authorized()
  async getAnnouncements(
    @Arg("LastAnnouncementId") lastAnnouncementId: string,
    @Arg("take") take: number,
    @Arg("HostelId") hostelId: string,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      let hostel = await Hostel.findOne({
        where: { id: hostelId },
        relations: ["announcements"],
      });

      const d = new Date();
      let announcements = hostel?.announcements!.filter(
        (n) =>
          new Date(n.endTime).getTime() > d.getTime() && n.isHidden === false
      );
      if (!announcements) throw new Error("No Announcements Found");
      const total = announcements.length;
      announcements?.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
      );

      var announcementsList: Announcement[] = [];
      if (search) {
        await Promise.all(
          ["title"].map(async (field: string) => {
            const filter = { [field]: Like(`%${search}%`) };
            const announcementF = await Announcement.find({
              where: filter,
              order: { createdAt: "DESC" },
            });
            announcementF.forEach((ann) => {
              announcementsList.push(ann);
            });
          })
        );
        const annStr = announcementsList.map((obj) => JSON.stringify(obj));
        const uniqueAnnStr = new Set(annStr);
        announcements = Array.from(uniqueAnnStr).map((str) => JSON.parse(str));
      }
      if (lastAnnouncementId) {
        const index = announcements
          .map((n) => n.id)
          .indexOf(lastAnnouncementId);
        announcementsList = announcements.splice(index + 1, take);
      } else {
        announcementsList = announcements;
      }
      return { announcementsList: announcementsList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutataion to update Announcement, Restrictions : {Admin, Hostel Affair Secretory, Hostel Secretory}",
  })
  @Authorized([
    UserRole.ADMIN,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
    UserRole.SECRETORY,
  ])
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
          [UserRole.ADMIN, UserRole.SECRETORY, UserRole.HAS].includes(
            user.role
          ))
      ) {
        if (images) {
          announcementInput.images = (await addAttachments(images, true)).join(
            " AND "
          );
          announcement.images = announcementInput.images;
        }
        if (announcementInput.title)
          announcement.title = announcementInput.title;
        if (announcementInput.description)
          announcement.description = announcementInput.description;
        if (announcementInput.endTime)
          announcement.endTime = new Date(announcementInput.endTime);
        if (announcementInput.hostelIds) {
          let hostels: Hostel[] = [];
          await Promise.all(
            announcementInput.hostelIds.map(async (id) => {
              const hostel = await Hostel.findOne(id);
              if (hostel) hostels.push(hostel);
            })
          );
          announcement.hostels = hostels;
        }
        const announcementUpdated = await announcement.save();
        return !!announcementUpdated;
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
  @Authorized([
    UserRole.ADMIN,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
    UserRole.SECRETORY,
  ])
  async resolveAnnouncement(
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
          [UserRole.ADMIN, UserRole.SECRETORY, UserRole.HAS].includes(
            user.role
          ))
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
