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
import {
  createNetopsInput,
  editNetopsInput,
  fileringConditions,
} from "../types/inputs/netop";
import Tag from "../entities/Tag";
import Netop from "../entities/Netop";
import Comment from "../entities/Common/Comment";
import { GraphQLUpload, Upload } from "graphql-upload";
import getNetopOutput from "../types/objects/netop";
import { smail, UserRole } from "../utils";
import Report from "../entities/Common/Report";
import addAttachments from "../utils/uploads";
import User from "../entities/User";
import fcm from "../utils/fcmTokens";
import { Notification } from "../utils/index";
import { ILike, In } from "typeorm";
import { mail } from "../utils/mail";

@Resolver(Netop)
class NetopResolver {
  @Mutation(() => Boolean, {
    description:
      "create network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createNetop(
    @Arg("NewNetopData") createNetopsInput: createNetopsInput,
    @Ctx() { user }: MyContext,
    @Arg("Image", () => [GraphQLUpload], { nullable: true }) images?: Upload[],
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ): Promise<boolean> {
    try {
      var tags: Tag[] = [];
      let iUsers: User[] = [];

      await Promise.all(
        createNetopsInput.tags.map(async (id) => {
          const tag = await Tag.findOne(id, { relations: ["netops", "users"] });
          if (tag) {
            tags = tags.concat([tag]);
            iUsers = iUsers.concat(tag.users);
          }
        })
      );

      if (tags.length !== createNetopsInput.tags.length)
        throw new Error("Invalid tagIds");

      if (images)
        createNetopsInput.photo = (await addAttachments([...images], true)).join(
          " AND "
        );
      if (attachments)
        createNetopsInput.attachments = (
          await addAttachments([...attachments], false)
        ).join(" AND ");

      const netop = await Netop.create({
        ...createNetopsInput,
        createdBy: user,
        endTime: new Date(createNetopsInput.endTime),
        likeCount: 0,
        tags,
      }).save();

      const users = await User.find({
        where: { notifyNetop: Notification.FORALL },
      });
      if (users) iUsers = iUsers.concat(users);

      let iUsersIds = iUsers.map((u) => u.fcmToken);

      const iUsersSet = new Set<string>(iUsersIds);
      iUsersIds = Array.from(iUsersSet);

      iUsers = [];

      await Promise.all(
        iUsersIds.map(async (ft) => {
          const u = await User.findOneOrFail({
            where: { fcmToken: ft },
          });
          console.log("Bahar", u.roll, u.notifyEvent, u.notifyNetop);
          if (u.notifyNetop !== Notification.NONE && u.id != user.id)
            iUsers.push(u);
        })
      );
      if (!!netop) {
        iUsers.map((u) => {
          u.fcmToken &&
            u.fcmToken.split(" AND ").map(async (ft) => {
              console.log("inside netop create", u.name, ft);

              const message = {
                to: ft,
                notification: {
                  title: `Hi ${u?.name}`,
                  body: "you may interested for netop",
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
        });
        return true;
      }

      return !!netop;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "edit network and opportunity, Restrictions:{user who created}",
  })
  @Authorized()
  async editNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("EditNetopsData") editNetopsInput: editNetopsInput,
    @Arg("Image", () => [GraphQLUpload], { nullable: true }) images?: [Upload],
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["tags", "createdBy"],
      });

      if (netop && user.id === netop?.createdBy.id) {
        if (images)
          editNetopsInput.photo = (await addAttachments([...images], true)).join(
            " AND "
          );
        if (attachments)
          editNetopsInput.attachments = (
            await addAttachments([...attachments], false)
          ).join(" AND ");

        if (editNetopsInput.tagIds) {
          let tags: Tag[] = [];
          await Promise.all(
            editNetopsInput.tagIds.map(async (id) => {
              const tag = await Tag.findOne(id, { relations: ["netops"] });
              if (tag) tags.push(tag);
            })
          );
          netop.tags = tags;
        }
        if (editNetopsInput.title) netop.title = editNetopsInput.title;
        if (editNetopsInput.content) netop.content = editNetopsInput.content;
        if (editNetopsInput.endTime)
          netop.endTime = new Date(editNetopsInput.endTime);
        if (editNetopsInput.linkName) netop.linkName = editNetopsInput.linkName;
        if (editNetopsInput.linkToAction)
          netop.linkToAction = editNetopsInput.linkToAction;

        const netopUpdated = await netop.save();
        return !!netopUpdated;
      } else {
        throw new Error("Unauthorized");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "edit network and opportunity, Restrictions:{user who created}",
  })
  @Authorized()
  async deleteNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOneOrFail(netopId, {
        relations: ["createdBy"],
      });
      if (netop.createdBy.id === user.id) {
        const { affected } = await Netop.update(netopId, { isHidden: true });
        return affected === 1;
      } else throw Error("Unauthorized");
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "like or unlike (if it's previously liked) network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async toggleLikeNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["likedBy"] });
      let netopUpdated;
      if (netop) {
        if (netop.likedBy.filter((u) => u.id === user.id).length) {
          netop.likedBy = netop.likedBy.filter((e) => e.id !== user.id);
        } else {
          netop.likedBy.push(user);
        }
        netopUpdated = await netop.save();
        return !!netopUpdated;
      } else {
        throw new Error("Invalid netop id");
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "star or unstar (if it's previously star) network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async toggleStar(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["staredBy"] });
      let netopUpdated;
      if (netop) {
        if (netop.staredBy.filter((u) => u.id === user.id).length) {
          netop.staredBy = netop.staredBy.filter((e) => e.id !== user.id);
        } else {
          netop.staredBy.push(user);
        }
        netopUpdated = await netop.save();
        return !!netopUpdated;
      } else {
        throw new Error("Invalid netop id");
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "report network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async reportNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("description") description: string
  ) {
    try {
      let netop = await Netop.findOneOrFail(netopId, {
        relations: ["reports", "createdBy"],
      });
      const report = await Report.create({
        netop,
        description,
        createdBy: user,
      }).save();

      const { affected } = await Netop.update(netop.id, { isHidden: true });

      if (process.env.NODE_ENV !== "development") {
        const superUsersList = await User.find({
          where: {
            role: In([UserRole.ADMIN, UserRole.LEADS, UserRole.MODERATOR]),
          },
        });
        let mailList: String[] = [];
        superUsersList.forEach((user) => {
          if (user.role === UserRole.MODERATOR) {
            const email = user.roll.concat(smail);
            mailList.push(email);
          } else {
            mailList.push(user.roll);
          }
        });
        console.log(mailList);
        await mail({
          email: mailList.join(", "),
          subject: "Report",
          htmlContent: "Your post has been reported!",
        });
      }

      const creator = netop.createdBy;

      if (!!report && affected) {
        creator.fcmToken.split(" AND ").map((ft) => {
          const message = {
            to: ft,
            notification: {
              title: `Hi ${creator.name}`,
              body: "your netop got reported",
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
        return true;
      }
      return false;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "comment on network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createCommentNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("content") content: string,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["comments", "createdBy"],
      });
      if (netop) {
        let photos;

        if (images) {
          photos = (await addAttachments([...images], true)).join(" AND ");
        }

        const comment = await Comment.create({
          content,
          netop,
          createdBy: user,
          images: photos,
        }).save();

        const creator = netop.createdBy;

        if (!!comment && creator.notifyNetopComment) {
          creator.fcmToken &&
            creator.fcmToken.split(" AND ").map((ft) => {
              const message = {
                to: ft,
                notification: {
                  title: `Hi ${creator.name}`,
                  body: "your netop got commented",
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

        return !!comment;
      }
      throw new Error("Post not found");
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized([
    UserRole.ADMIN,
    UserRole.LEADS,
    UserRole.HAS,
    UserRole.SECRETORY,
    UserRole.HOSTEL_SEC,
    UserRole.MODERATOR,
  ])
  async removeNetop(
    @Arg("NetopId") netopId: string,
    @Arg("ReportId") reportId: string
  ) {
    let { affected } = await Netop.update(netopId, {
      isHidden: true,
    });
    let { affected: a2 } = await Report.update(reportId, { isResolved: true });

    if (affected === 1 && a2 === 1) {
      let netop = await Netop.findOneOrFail(netopId);

      const creator = netop.createdBy;

      creator.fcmToken.split(" AND ").map((ft) => {
        const message = {
          to: ft,
          notification: {
            title: `Hi ${creator.name}`,
            body: "your netop got resolved and now its displayed",
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
      return true;
    }
    return false;
  }

  @Mutation(() => Boolean)
  @Authorized([
    UserRole.ADMIN,
    UserRole.LEADS,
    UserRole.HAS,
    UserRole.SECRETORY,
    UserRole.HOSTEL_SEC,
    UserRole.MODERATOR,
  ])
  async resolveNetop(
    @Arg("NetopId") netopId: string,
    @Arg("ReportId") reportId: string
  ) {
    let { affected } = await Netop.update(netopId, {
      isHidden: false,
    });
    let { affected: a2 } = await Report.update(reportId, { isResolved: true });

    if (affected === 1 && a2 === 1) {
      let netop = await Netop.findOneOrFail(netopId);

      const creator = netop.createdBy;

      creator.fcmToken.split(" AND ").map((ft) => {
        const message = {
          to: ft,
          notification: {
            title: `Hi ${creator.roll}`,
            body: "your netop got reported",
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
      return true;
    }
    return false;
  }

  @Query(() => Netop, {
    description: "get an netop by id network and opportunity",
  })
  @Authorized()
  async getNetop(@Arg("NetopId") netopId: string) {
    try {
      const netop = await Netop.findOne(netopId);

      const d = new Date();
      if (
        netop &&
        !netop.isHidden &&
        new Date(netop.endTime).getTime() > d.getTime()
      )
        return netop;
      else return null;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Query(() => getNetopOutput, {
    description: "get a list of netops by filer and order conditions",
  })
  @Authorized()
  async getNetops(
    @Ctx() { user }: MyContext,
    @Arg("LastNetopId") lastNetopId: string,
    @Arg("take") take: number,
    @Arg("FileringCondition", { nullable: true })
    fileringConditions?: fileringConditions,
    @Arg("OrderByLikes", () => Boolean, { nullable: true })
    orderByLikes?: Boolean,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      let netopList: Netop[] = [];

      if (search) {
        await Promise.all(
          ["title"].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`) };
            const netopF = await Netop.find({
              where: filter,
              relations: ["tags", "likedBy", "staredBy", "reports"],
              order: { createdAt: "DESC" },
            });
            netopF.forEach((netop) => {
              netopList.push(netop);
            });
          })
        );
      } else {
        netopList = await Netop.find({
          where: { isHidden: false },
          relations: ["tags", "likedBy", "staredBy", "reports"],
          order: { createdAt: "DESC" },
        });
      }

      const d = new Date();
      if (fileringConditions && fileringConditions.isStared) {
        netopList = netopList.filter((n) => {
          return fileringConditions.tags && fileringConditions.tags.length
            ? n.staredBy.filter((u) => u.id === user.id).length &&
                new Date(n.endTime).getTime() > d.getTime() &&
                n.tags.filter((tag) => fileringConditions.tags.includes(tag.id))
                  .length
            : n.staredBy.filter((u) => u.id === user.id).length &&
                new Date(n.endTime).getTime() > d.getTime();
        });
      } else if (
        fileringConditions &&
        fileringConditions.tags &&
        fileringConditions.tags.length
      ) {
        netopList = netopList.filter(
          (n) =>
            new Date(n.endTime).getTime() > d.getTime() &&
            n.tags.filter((tag) => fileringConditions.tags.includes(tag.id))
              .length
        );
      } else {
        netopList = netopList.filter(
          (n) => new Date(n.endTime).getTime() > d.getTime()
        );
      }

      let total = netopList.length;

      if (orderByLikes) {
        netopList.sort((a, b) =>
          a.likedBy.length > b.likedBy.length
            ? -1
            : a.likedBy.length < b.likedBy.length
            ? 1
            : 0
        );
      } else {
        netopList.sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
        );
      }

      var finalList;

      if (lastNetopId) {
        const index = netopList.map((n) => n.id).indexOf(lastNetopId);
        finalList = netopList.splice(index + 1, take);
      } else {
        finalList = netopList.splice(0, take);
      }

      return { netopList: finalList, total };
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @FieldResolver(() => [Report], {
    nullable: true,
    description: "get list of reports",
  })
  async reports(@Root() { id, reports }: Netop) {
    if (reports) return reports;
    const netop = await Netop.findOne(id, {
      relations: ["reports"],
    });
    return netop?.reports;
  }

  @FieldResolver(() => [Comment], {
    nullable: true,
    description: "get list of comments",
  })
  async comments(@Root() { id, comments }: Netop) {
    if (comments) return comments;
    const netop = await Netop.findOne(id, {
      relations: ["comments"],
    });
    return netop?.comments;
  }

  @FieldResolver(() => Number, { description: "get number of likes" })
  async likeCount(@Root() { id, likedBy }: Netop) {
    if (likedBy) return likedBy.length;
    const netop = await Netop.findOne(id, { relations: ["likedBy"] });
    const like_count = netop?.likedBy.length;
    return like_count;
  }

  @FieldResolver(() => [Tag], {
    nullable: true,
    description: "get all the tags associated",
  })
  async tags(@Root() { id, tags }: Netop) {
    if (tags) return tags;
    const netop = await Netop.findOne(id, {
      relations: ["tags"],
    });
    return netop?.tags;
  }

  @FieldResolver(() => Boolean, {
    description: "check if network and opportunity is stared by current user",
  })
  async isStared(@Root() { id, staredBy }: Netop, @Ctx() { user }: MyContext) {
    if (staredBy) return staredBy?.filter((u) => u.id === user.id).length;
    const netop = await Netop.findOne(id, { relations: ["staredBy"] });
    return netop?.staredBy?.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => Boolean, {
    description: "check if network and opportunity is liked by current user",
  })
  async isLiked(@Root() { id, likedBy }: Netop, @Ctx() { user }: MyContext) {
    if (likedBy) return likedBy.filter((u) => u.id === user.id).length;
    const netop = await Netop.findOne(id, { relations: ["likedBy"] });
    return netop?.likedBy.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => Boolean)
  async isReported(@Root() { id }: Netop) {
    const netop = await Netop.findOneOrFail(id, { relations: ["reports"] });
    return netop.reports.length && true;
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Netop) {
    if (createdBy) return createdBy;
    const netop = await Netop.findOne(id, { relations: ["createdBy"] });
    return netop?.createdBy;
  }

  @FieldResolver(() => Number)
  async commentCount(@Root() { id, comments }: Netop) {
    if (comments) return comments.length;
    const netop = await Netop.findOneOrFail(id, { relations: ["comments"] });
    return netop.comments.length;
  }
}

export default NetopResolver;
