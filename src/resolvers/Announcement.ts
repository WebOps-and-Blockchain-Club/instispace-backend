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
  Query,
  Resolver,
  Root,
} from "type-graphql";
import MyContext from "../utils/context";
import { EditDelPermission, UserRole } from "../utils";
import addAttachments from "../utils/uploads";
import { GraphQLUpload, Upload } from "graphql-upload";
import { getAnnouncementsOutput } from "../types/objects/announcements";
import fcm from "../utils/fcmTokens";
import { ILike } from "typeorm";

@Resolver((_type) => Announcement)
class AnnouncementResolver {
  @Mutation(() => Announcement, {
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
    @Ctx() { user }: MyContext,
    @Arg("AnnouncementInput")
    announcementInput: CreateAnnouncementInput,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      let hostels: Hostel[] = [];
      let iUsers: User[] = [];
      await Promise.all(
        announcementInput.hostelIds.map(async (id) => {
          const hostel = await Hostel.findOne(id, { relations: ["users"] });
          if (hostel) {
            hostels.push(hostel);
            iUsers = iUsers.concat(hostel.users);
          }
        })
      );

      const announcement = new Announcement();
      announcement.title = announcementInput.title;
      announcement.description = announcementInput.description;
      announcement.user = user;
      announcement.endTime = new Date(announcementInput.endTime);
      if (images) {
        announcementInput.images = (
          await addAttachments([...images], true)
        ).join(" AND ");
        announcement.images = announcementInput.images;
      }
      announcement.hostels = hostels;

      if (!!announcement) {
        iUsers.map((u) => {
          const message = {
            to: u.fcmToken,
            notification: {
              title: `announcement`,
              body: "your hostel's new announcement",
            },
          };

          fcm.send(message, (err: any, response: any) => {
            if (err) {
              console.log("Something has gone wrong!" + err);
              console.log("Respponse:! " + response);
            } else {
              // showToast("Successfully sent with response");
              console.log("Successfully sent with response: ", response);
            }
          });
        });
      }
      const announcementCreated = await announcement.save();
      return announcementCreated;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => Announcement)
  async getAnnouncement(@Arg("announcementId") announcementId: string) {
    const announcement = await Announcement.findOne(announcementId);
    const d = new Date();

    if (
      announcement &&
      !announcement.isHidden &&
      new Date(announcement.endTime).getTime() > d.getTime()
    ) {
      return announcement;
    }
    return null;
  }

  @Query(() => getAnnouncementsOutput, {
    description:
      "Query to fetch announcements of a particular hostel, Restrictions : { anyone who is authorised } ",
  })
  @Authorized()
  async getAnnouncements(
    @Arg("LastAnnouncementId") lastAnnouncementId: string,
    @Arg("take") take: number,
    @Ctx() { user }: MyContext,
    @Arg("HostelId") hostelId?: string,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      if ([UserRole.MODERATOR, UserRole.USER].includes(user.role) && !hostelId)
        throw new Error("Invalid Hostel Input");

      let announcementsList: Announcement[] = [];
      if (search) {
        await Promise.all(
          ["title"].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`) };
            const announcementF = await Announcement.find({
              where: filter,
              order: { createdAt: "DESC" },
            });
            announcementF.forEach((ann) => {
              announcementsList.push(ann);
            });
          })
        );
      } else {
        if (hostelId) {
          let hostel = await Hostel.findOne({
            where: { id: hostelId },
            relations: ["announcements"],
          });
          announcementsList = hostel!.announcements!;
          announcementsList.sort((a, b) =>
            a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
          );
        } else {
          announcementsList = await Announcement.find({
            order: { createdAt: "DESC" },
          });
        }
      }
      const d = new Date();
      announcementsList.filter(
        (n) =>
          new Date(n.endTime).getTime() > d.getTime() && n.isHidden === false
      );
      const total = announcementsList.length;
      if (lastAnnouncementId) {
        const index = announcementsList
          .map((n) => n.id)
          .indexOf(lastAnnouncementId);
        announcementsList = announcementsList.splice(index + 1, take);
      } else {
        announcementsList = announcementsList.splice(0, take);
      }
      return { announcementsList: announcementsList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Announcement, {
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
        let imageDataStr = images
          ? await addAttachments([...images], true)
          : [];
        let imageUrlStr = [
          ...imageDataStr,
          ...(announcementInput.imageUrls ?? []),
        ].join(" AND ");
        announcement.images = imageUrlStr;

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
        return announcementUpdated;
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

  @FieldResolver(() => [EditDelPermission])
  async permissions(
    @Ctx() { user }: MyContext,
    @Root() { id, permissions }: Announcement
  ) {
    try {
      if (permissions) return permissions;
      const permissionList: EditDelPermission[] = [];
      const announcement = await Announcement.findOne(id, {
        relations: ["user"],
      });
      if (
        announcement &&
        ([UserRole.ADMIN, UserRole.SECRETORY, UserRole.HAS].includes(
          user.role
        ) ||
          user.id === announcement.user.id)
      )
        permissionList.push(EditDelPermission.EDIT, EditDelPermission.DELETE);
      return permissionList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default AnnouncementResolver;
