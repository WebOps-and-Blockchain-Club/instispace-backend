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
  CreateNetopsInput,
  EditNetopsInput,
  FilteringConditions,
  OrderInput,
  ReportPostInput,
} from "../types/inputs/netop";
import Tag from "../entities/Tag";
import Netop from "../entities/Netop";
import Comment from "../entities/Common/Comment";
import { GraphQLUpload, Upload } from "graphql-upload";
import getNetopOutput from "../types/objects/netop";
import { EditDelPermission, UserRole } from "../utils";
import Report from "../entities/Common/Report";
import addAttachments from "../utils/uploads";
import User from "../entities/User";
import fcm from "../utils/fcmTokens";
import { Notification } from "../utils/index";
import { In } from "typeorm";
import { mail } from "../utils/mail";
import { smail } from "../utils/config.json";
import Reason from "../entities/Common/Reason";

@Resolver(Netop)
class NetopResolver {
  @Mutation(() => Netop, {
    description:
      "create network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createNetop(
    @Arg("NewNetopData") createNetopsInput: CreateNetopsInput,
    @Ctx() { user }: MyContext,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ): Promise<Netop> {
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

      if (attachments)
        createNetopsInput.attachments = (
          await addAttachments([...attachments], false)
        ).join(" AND ");

      let imageUrls;
      if (createNetopsInput.imageUrls) {
        imageUrls = createNetopsInput.imageUrls?.join(" AND ");
      }
      const netop = await Netop.create({
        ...createNetopsInput,
        photo: imageUrls === "" ? null : imageUrls,
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
          if (u.notifyNetop !== Notification.NONE && u.id != user.id)
            iUsers.push(u);
        })
      );
      if (!!netop) {
        iUsers.map((u) => {
          u.fcmToken &&
            u.fcmToken.split(" AND ").map(async (ft) => {
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
      }

      return netop;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Netop, {
    description:
      "edit network and opportunity, Restrictions:{user who created}",
  })
  @Authorized()
  async editNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("EditNetopsData") editNetopsInput: EditNetopsInput,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["tags", "createdBy"],
      });

      if (netop && user.id === netop?.createdBy.id) {
        let imageUrlStr = [...(editNetopsInput.imageUrls ?? [])].join(" AND ");
        netop.photo = imageUrlStr === "" ? null : imageUrlStr;

        if (attachments) {
          editNetopsInput.attachments = (
            await addAttachments([...attachments], false)
          ).join(" AND ");
          netop.attachments = editNetopsInput.attachments;
        }

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
        return netopUpdated;
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
    @Arg("ReportPostInput") reportPostInput: ReportPostInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      let netop = await Netop.findOneOrFail(netopId, {
        relations: ["reports", "createdBy"],
      });

      let hideStatus: Boolean = false;

      let rReason = await Reason.findOne({ id: reportPostInput.description });

      if (rReason) {
        reportPostInput.description = rReason.reason;
        if (
          netop.reports.filter(
            (r) => r.description === reportPostInput.description
          ).length +
            1 >=
          rReason.count
        )
          hideStatus = true;
      }

      const report = await Report.create({
        netop,
        description: reportPostInput.description,
        createdBy: user,
      }).save();

      if (!netop.isHidden && hideStatus) {
        netop.isHidden = true;
        await netop.save();
      }

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
        await mail({
          email: mailList.join(", "),
          subject: "Report",
          htmlContent: "Your post has been reported!",
        });
      }

      const creator = netop.createdBy;

      if (!!report && !!netop) {
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
      throw new Error(e.message);
    }
  }

  @Mutation(() => Comment, {
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

        return comment;
      }
      throw new Error("Post not found");
    } catch (e) {
      throw new Error(e.message);
    }
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
      throw new Error(e.message);
    }
  }

  @Query(() => getNetopOutput, {
    description: "get a list of netops by filter and order conditions",
  })
  @Authorized()
  async getNetops(
    @Ctx() { user }: MyContext,
    @Arg("LastNetopId") lastNetopId: string,
    @Arg("take") take: number,
    @Arg("Filters", { nullable: true })
    filteringConditions?: FilteringConditions,
    @Arg("Sort", { nullable: true })
    orderInput?: OrderInput
  ) {
    try {
      let netopList = await Netop.find({
        where: { isHidden: false },
        relations: ["tags", "likedBy", "staredBy", "reports"],
        order: { createdAt: "DESC" },
      });

      const d = new Date();

      // default filters (endtime should not exceed, user shouldn't see his reported posts) and sort (later posts first)
      netopList = netopList.filter(
        (n) =>
          new Date(n.endTime).getTime() > d.getTime() &&
          !n.reports.filter((nr) => nr.createdBy.id === user.id).length
      );

      // filters based on input filter conditions
      if (filteringConditions) {
        if (filteringConditions.search) {
          netopList = netopList.filter((netop) =>
            JSON.stringify(netop)
              .toLowerCase()
              .includes(filteringConditions.search?.toLowerCase()!)
          );
        }

        if (filteringConditions.isStared) {
          netopList = netopList.filter(
            (n) => n.staredBy.filter((u) => u.id === user.id).length
          );
        }

        if (filteringConditions.tags && filteringConditions.tags.length) {
          netopList = netopList.filter(
            (n) =>
              n.tags.filter((tag) => filteringConditions.tags.includes(tag.id))
                .length
          );
        }
      }

      // sorts based on input sort conditions
      if (orderInput) {
        if (orderInput.byLikes == true) {
          netopList.sort((a, b) =>
            a.likedBy.length > b.likedBy.length
              ? -1
              : a.likedBy.length < b.likedBy.length
              ? 1
              : 0
          );
        } else if (orderInput.byLikes == false) {
          netopList.sort((a, b) =>
            a.likedBy.length < b.likedBy.length
              ? -1
              : a.likedBy.length > b.likedBy.length
              ? 1
              : 0
          );
        }

        if (orderInput.stared) {
          netopList.sort((a, b) =>
            a.isStared === false && b.isStared === true
              ? 1
              : a.isStared === false && b.isStared === false
              ? 0
              : -1
          );
        }

        if (orderInput.byComments === true) {
          netopList.sort((a, b) =>
            a.comments.length > b.comments.length
              ? -1
              : a.likedBy.length < b.likedBy.length
              ? 1
              : 0
          );
        } else if (orderInput.byComments === false) {
          netopList.sort((a, b) =>
            a.comments.length < b.comments.length
              ? -1
              : a.likedBy.length > b.likedBy.length
              ? 1
              : 0
          );
        }
      }

      // pagination
      let total = netopList.length;

      var finalList;

      if (lastNetopId) {
        const index = netopList.map((n) => n.id).indexOf(lastNetopId);
        finalList = netopList.splice(index + 1, take);
      } else {
        finalList = netopList.splice(0, take);
      }

      return { netopList: finalList, total };
    } catch (e) {
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

  @FieldResolver(() => Number)
  async reportCount(@Root() { id, reports }: Netop) {
    try {
      if (reports) return reports.length;
      const netop = await Netop.findOne({ where: id, relations: ["reports"] });
      return netop?.reports.length;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
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

  @FieldResolver(() => [EditDelPermission])
  async permissions(
    @Ctx() { user }: MyContext,
    @Root() { id, permissions }: Netop
  ) {
    try {
      if (permissions) return permissions;
      const permissionList: EditDelPermission[] = [
        EditDelPermission.COMMENT,
        EditDelPermission.REPORT,
      ];
      const netop = await Netop.findOne(id, { relations: ["createdBy"] });
      if (user.id === netop?.createdBy.id)
        permissionList.push(EditDelPermission.EDIT, EditDelPermission.DELETE);
      if (
        [
          UserRole.ADMIN,
          UserRole.LEADS,
          UserRole.HAS,
          UserRole.SECRETARY,
          UserRole.HOSTEL_SEC,
          UserRole.MODERATOR,
        ].includes(user.role)
      )
        permissionList.push(EditDelPermission.RESOLVE);
      return permissionList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default NetopResolver;
