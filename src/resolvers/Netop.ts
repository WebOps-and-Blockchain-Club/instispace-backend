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
  CommentInput,
} from "../types/inputs/netop";
import Tag from "../entities/Tag";
import Netop from "../entities/Netop";
import Comment from "../entities/Common/Comment";
import getNetopOutput from "../types/objects/netop";
import { EditDelPermission, PostStatus, UserRole } from "../utils";
import Report from "../entities/Common/Report";
import User from "../entities/User";
import NotificationService from "../services/notification";
import Reason from "../entities/Common/Reason";
import { In } from "typeorm";

@Resolver(Netop)
class NetopResolver {
  @Mutation(() => Netop, {
    description:
      "create network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createNetop(
    @Arg("NewNetopData") createNetopsInput: CreateNetopsInput,
    @Ctx() { user }: MyContext
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

      let attachmentUrls;
      if (createNetopsInput.attachmentUrls)
        attachmentUrls = createNetopsInput.attachmentUrls.join(" AND ");

      let imageUrls;
      if (createNetopsInput.imageUrls)
        imageUrls = createNetopsInput.imageUrls.join(" AND ");

      const netop = await Netop.create({
        ...createNetopsInput,
        photo: imageUrls === "" ? null : imageUrls,
        attachments: attachmentUrls === "" ? null : attachmentUrls,
        createdBy: user,
        endTime: new Date(createNetopsInput.endTime),
        likeCount: 0,
        tags,
      }).save();

      // Send Notification
      NotificationService.notifyNewNetop(netop);

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
    @Arg("EditNetopsData") editNetopsInput: EditNetopsInput
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["tags", "createdBy"],
      });

      if (netop && user.id === netop?.createdBy.id) {
        let imageUrlStr = [...(editNetopsInput.imageUrls ?? [])].join(" AND ");
        netop.photo = imageUrlStr === "" ? null : imageUrlStr;

        let attachmentUrlStr = [...(editNetopsInput.attachmentUrls ?? [])].join(
          " AND "
        );
        netop.attachments = attachmentUrlStr === "" ? null : attachmentUrlStr;

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

      let rReason = await Reason.findOne({
        reason: reportPostInput.description,
      });

      if (rReason) {
        netop.status = [PostStatus.POSTED, PostStatus.REPORTED].includes(
          netop.status
        )
          ? netop.reports.filter(
              (r) => r.description === reportPostInput.description
            ).length +
              1 >=
            rReason.count
            ? PostStatus.IN_REVIEW
            : PostStatus.REPORTED
          : netop.status;
      }

      const netopUpdated = await netop.save();

      const report = await Report.create({
        description: reportPostInput.description,
        netop: netopUpdated,
        createdBy: user,
      }).save();

      // Send Notification
      NotificationService.notifyReportNetop(
        netopUpdated,
        report.description
      );
      if (netopUpdated.status === PostStatus.IN_REVIEW)
        NotificationService.notifyReportModerator(
          netopUpdated.title,
          report.description
        );

      return !!report && !!netopUpdated;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized([
    UserRole.ADMIN,
    UserRole.HAS,
    UserRole.SECRETARY,
    UserRole.MODERATOR,
  ])
  async resolveNetopReport(
    @Arg("id") id: string,
    @Arg("status") status: PostStatus
  ) {
    try {
      const { affected } = await Netop.update(id, {
        status,
      });
      return affected === 1;
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
    @Arg("CommentData") commentInput: CommentInput
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["comments", "createdBy"],
      });
      if (netop) {
        let imageUrls;
        if (commentInput.imageUrls)
          imageUrls = commentInput.imageUrls.join(" AND ");

        const comment = await Comment.create({
          content: commentInput.content,
          netop,
          createdBy: user,
          images: imageUrls === "" ? null : imageUrls,
        }).save();

        // Send Notification
        NotificationService.notifyNewCommentNetop(
          netop,
          comment.content
        );

        return comment;
      }
      throw new Error("Post not found");
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Delete the comment by id, Restrictions:{CREATED USER,POST OWNER, ADMIN, MODERATOR, SECRETARY}",
  })
  @Authorized()
  async deleteCommentNetop(
    @Arg("NetopId") netopId: string,
    @Arg("CommentId") commentId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const comment = await Comment.findOneOrFail(commentId, {
        relations: ["createdBy", "netop"],
      });

      const netop = await Netop.findOneOrFail(netopId, {
        relations: ["createdBy"],
      });

      if (
        comment.createdBy.id === user.id ||
        netop.createdBy.id === user.id ||
        [UserRole.ADMIN, UserRole.SECRETARY, UserRole.MODERATOR].includes(
          user.role
        )
      ) {
        const { affected } = await Comment.update(commentId, {
          isHidden: true,
        });
        return affected === 1;
      } else throw Error("Unauthorized");
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
        where: {
          isHidden: false,
          status: In([
            PostStatus.POSTED,
            PostStatus.REPORTED,
            PostStatus.REPORT_REJECTED,
          ]),
        },
        relations: [
          "tags",
          "likedBy",
          "comments",
          "staredBy",
          "reports",
          "reports.createdBy",
        ],
        order: { createdAt: "DESC" },
      });

      const d = new Date();

      // default filters (endtime should not exceed, user shouldn't see his reported posts) and sort (later posts first)
      netopList = netopList.filter(
        (n) =>
          new Date(n.endTime).getTime() > d.getTime() &&
          n.reports.filter((nr) => nr.createdBy.id === user.id).length === 0
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
          netopList.sort((a, b) => {
            return a.staredBy.filter((u) => u.id === user.id).length >
              b.staredBy.filter((u) => u.id === user.id).length
              ? -1
              : a.staredBy.filter((u) => u.id === user.id).length <
                b.staredBy.filter((u) => u.id === user.id).length
              ? 1
              : 0;
          });
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
    if (comments)
      return comments.sort((a, b) =>
        a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0
      );

    const netop = await Netop.findOne(id, {
      relations: ["comments"],
      order: { createdAt: "ASC" },
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
    if (comments) return comments.filter((comment) => !comment.isHidden).length;
    const netops = await Netop.findOneOrFail(id, {
      relations: ["comments"],
    });
    return netops.comments.filter((comment) => !comment.isHidden).length;
  }

  @FieldResolver(() => [EditDelPermission])
  async permissions(
    @Ctx() { user }: MyContext,
    @Root() { id, permissions }: Netop
  ) {
    try {
      if (permissions) return permissions;
      const permissionList: EditDelPermission[] = [EditDelPermission.COMMENT];
      const netop = await Netop.findOne(id, { relations: ["createdBy"] });
      if (user.id === netop?.createdBy.id)
        permissionList.push(EditDelPermission.EDIT, EditDelPermission.DELETE);
      else permissionList.push(EditDelPermission.REPORT);
      if (
        [
          UserRole.ADMIN,
          UserRole.HAS,
          UserRole.SECRETARY,
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
