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
import { createQuerysInput, editQuerysInput } from "../types/inputs/query";
import MyQuery from "../entities/MyQuery";
import Comment from "../entities/Common/Comment";
import { GraphQLUpload, Upload } from "graphql-upload";
import getMyQueryOutput from "../types/objects/query";
import { EditDelPermission, PostStatus, UserRole } from "../utils";
import Report from "../entities/Common/Report";
import addAttachments from "../utils/uploads";
import User from "../entities/User";
import NotificationService from "../services/notification";
import { ILike, In } from "typeorm";
import Reason from "../entities/Common/Reason";
import {
  FilteringConditions,
  OrderInput,
  ReportPostInput,
} from "../types/inputs/netop";

@Resolver(MyQuery)
class MyQueryResolver {
  @Mutation(() => MyQuery, {
    description: "create Query, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createMyQuery(
    @Arg("createQuerysInput") createMyQuerysInput: createQuerysInput,
    @Ctx() { user }: MyContext
  ): Promise<MyQuery> {
    try {
      let attachmentUrls;
      if (createMyQuerysInput.attachmentUrls)
        attachmentUrls = createMyQuerysInput.attachmentUrls.join(" AND ");

      let imageUrls;
      if (createMyQuerysInput.imageUrls) {
        imageUrls = createMyQuerysInput.imageUrls?.join(" AND ");
      }

      const myQuery = await MyQuery.create({
        ...createMyQuerysInput,
        photo: imageUrls === "" ? null : imageUrls,
        attachments: attachmentUrls === "" ? null : attachmentUrls,
        createdBy: user,
        isHidden: false,
        likeCount: 0,
      }).save();

      // Send Notification
      NotificationService.notifyNewQuery(myQuery);

      return myQuery;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => MyQuery, {
    description: "edit Query, Restrictions:{user who created}",
  })
  @Authorized()
  async editMyQuery(
    @Arg("EditMyQuerysData") editMyQuerysInput: editQuerysInput,
    @Arg("MyQueryId") myQueryId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const myQuery = await MyQuery.findOne(myQueryId, {
        relations: ["createdBy"],
      });

      if (
        myQuery &&
        (user.id === myQuery?.createdBy.id ||
          [UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC].includes(
            user.role
          ))
      ) {
        let imageUrlStr = [...(editMyQuerysInput.imageUrls ?? [])].join(
          " AND "
        );
        myQuery.photo = imageUrlStr === "" ? null : imageUrlStr;

        let attachmentUrlStr = [
          ...(editMyQuerysInput.attachmentUrls ?? []),
        ].join(" AND ");
        myQuery.attachments = attachmentUrlStr === "" ? null : attachmentUrlStr;

        if (editMyQuerysInput.title) myQuery.title = editMyQuerysInput.title;
        if (editMyQuerysInput.content)
          myQuery.content = editMyQuerysInput.content;
        const queryUpdated = myQuery.save();
        return queryUpdated;
      } else {
        throw new Error("Unauthorized");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "edit Query, Restrictions:{user who created}",
  })
  @Authorized()
  async deleteMyQuery(
    @Arg("MyQueryId") myQueryId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const myQuery = await MyQuery.findOne(myQueryId, {
        relations: ["createdBy"],
      });
      if (myQuery && user.id === myQuery?.createdBy?.id) {
        const { affected } = await MyQuery.update(myQueryId, {
          isHidden: true,
        });
        return affected === 1;
      }
      return false;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "like or unlike (if it's previously liked) Query, Restrictions:{any authorized user}",
  })
  @Authorized()
  async toggleLikeQuery(
    @Arg("MyQueryId") myQueryId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const myQuery = await MyQuery.findOne(myQueryId, {
        relations: ["likedBy"],
      });
      let myQueryUpdated;
      if (myQuery) {
        if (myQuery.likedBy.filter((u) => u.id === user.id).length) {
          myQuery.likedBy = myQuery.likedBy.filter((e) => e.id !== user.id);
        } else {
          myQuery.likedBy.push(user);
        }
        myQueryUpdated = await myQuery.save();
        return !!myQueryUpdated;
      } else {
        throw new Error("Invalid myQuery id");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "report Query, Restrictions:{any authorized user}",
  })
  @Authorized()
  async reportMyQuery(
    @Arg("MyQueryId") myQueryId: string,
    @Ctx() { user }: MyContext,
    @Arg("ReportMyQueryInput") reportPostInput: ReportPostInput
  ) {
    try {
      const myQuery = await MyQuery.findOneOrFail(myQueryId, {
        relations: ["reports", "createdBy"],
      });

      let rReason = await Reason.findOne({
        reason: reportPostInput.description,
      });

      if (rReason) {
        myQuery.status = [PostStatus.POSTED, PostStatus.REPORTED].includes(
          myQuery.status
        )
          ? myQuery.reports.filter(
              (r) => r.description === reportPostInput.description
            ).length +
              1 >=
            rReason.count
            ? PostStatus.IN_REVIEW
            : PostStatus.REPORTED
          : myQuery.status;
      }

      const myQueryUpdated = await myQuery.save();

      const report = await Report.create({
        query: myQueryUpdated,
        description: reportPostInput.description,
        createdBy: user,
      }).save();

      // Send Notification
      NotificationService.notifyReportQuery(
        myQueryUpdated.createdBy,
        myQueryUpdated.title,
        report.description
      );
      if (myQueryUpdated.status === PostStatus.IN_REVIEW)
        NotificationService.notifyReportModerator(
          myQueryUpdated.title,
          report.description
        );

      return !!report && !!myQueryUpdated;
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
  async resolveMyQueryReport(
    @Arg("id") id: string,
    @Arg("status") status: PostStatus
  ) {
    try {
      const { affected } = await MyQuery.update(id, {
        status,
      });
      return affected === 1;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Comment, {
    description: "comment on Query, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createCommentQuery(
    @Arg("MyQueryId") myQueryId: string,
    @Ctx() { user }: MyContext,
    @Arg("content") content: string,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      const myQuery = await MyQuery.findOne(myQueryId, {
        relations: ["comments", "createdBy"],
      });
      if (myQuery) {
        let photos;

        if (images) {
          photos = (await addAttachments([...images], true)).join(" AND ");
        }

        const comment = await Comment.create({
          content,
          query: myQuery,
          createdBy: user,
          images: photos,
        }).save();

        // Send Notification
        NotificationService.notifyNewCommentQuery(
          myQuery.createdBy,
          myQuery.title,
          comment.content
        );

        return comment;
      }
      throw new Error("Post not found");
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Query(() => MyQuery, {
    description: "get an myQuery by id Query",
  })
  @Authorized()
  async getMyQuery(@Arg("MyQueryId") myQueryId: string) {
    try {
      const myQuery = await MyQuery.findOne(myQueryId, {
        where: { isHidden: false },
      });
      return myQuery;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Query(() => getMyQueryOutput, {
    description: "get a list of myQuerys by filer and order conditions",
  })
  @Authorized()
  async getMyQuerys(
    @Arg("take") take: number,
    @Arg("lastEventId") lastEventId: string,
    @Ctx() { user }: MyContext,
    @Arg("Sort", { nullable: true })
    orderInput?: OrderInput,
    @Arg("Filters", { nullable: true })
    filteringConditions?: FilteringConditions
  ) {
    try {
      let myQueryList = await MyQuery.find({
        where: {
          isHidden: false,
          status: In([
            PostStatus.POSTED,
            PostStatus.REPORTED,
            PostStatus.REPORT_REJECTED,
          ]),
        },
        relations: ["likedBy", "reports", "reports.createdBy"],
        order: { createdAt: "DESC" },
      });

      myQueryList = myQueryList.filter(
        (n) => !n.reports.filter((qr) => qr.createdBy.id === user.id).length
      );

      if (filteringConditions) {
        if (filteringConditions.search) {
          myQueryList = myQueryList.filter((myQuery) =>
            JSON.stringify(myQuery)
              .toLowerCase()
              .includes(filteringConditions.search?.toLowerCase()!)
          );
        }
      }

      // sorts based on input sort conditions
      if (orderInput) {
        if (orderInput.byLikes == true) {
          myQueryList.sort((a, b) =>
            a.likedBy.length > b.likedBy.length
              ? -1
              : a.likedBy.length < b.likedBy.length
              ? 1
              : 0
          );
        } else if (orderInput.byLikes == false) {
          myQueryList.sort((a, b) =>
            a.likedBy.length < b.likedBy.length
              ? -1
              : a.likedBy.length > b.likedBy.length
              ? 1
              : 0
          );
        }

        if (orderInput.byComments === true) {
          myQueryList.sort((a, b) =>
            a.comments.length > b.comments.length
              ? -1
              : a.likedBy.length < b.likedBy.length
              ? 1
              : 0
          );
        } else if (orderInput.byComments === false) {
          myQueryList.sort((a, b) =>
            a.comments.length < b.comments.length
              ? -1
              : a.likedBy.length > b.likedBy.length
              ? 1
              : 0
          );
        }
      }

      const total = myQueryList.length;

      var finalList;

      if (lastEventId) {
        const index = myQueryList.map((n) => n.id).indexOf(lastEventId);
        finalList = myQueryList.splice(index + 1, take);
      } else {
        finalList = myQueryList.splice(0, take);
      }

      return { queryList: finalList, total };
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Query(() => getMyQueryOutput)
  @Authorized()
  async searchQueries(
    @Arg("search") search: string,
    @Arg("take") take: number,
    @Arg("lastEventId") lastEventId: string,
    @Arg("OrderByLikes", () => Boolean, { nullable: true })
    orderByLikes?: Boolean
  ) {
    let querys: MyQuery[] = [];

    await Promise.all(
      ["title"].map(async (field: string) => {
        const filter = { [field]: ILike(`%${search}%`) };
        const queryF = await MyQuery.find({
          where: filter,
          relations: ["likedBy"],
          order: { createdAt: "DESC" },
        });
        queryF.forEach((query) => {
          querys.push(query);
        });
      })
    );

    const total = querys.length;

    if (orderByLikes) {
      querys.sort((a, b) =>
        a.likedBy.length > b.likedBy.length
          ? -1
          : a.likedBy.length < b.likedBy.length
          ? 1
          : 0
      );
    } else {
      querys.sort((a, b) =>
        a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
      );
    }

    var finalList;

    if (lastEventId) {
      const index = querys.map((n) => n.id).indexOf(lastEventId);
      finalList = querys.splice(index + 1, take);
    } else {
      finalList = querys.splice(0, take);
    }
    return { queryList: finalList, total };
  }

  @FieldResolver(() => [Comment], {
    nullable: true,
    description: "get list of comments",
  })
  async comments(@Root() { id, comments }: MyQuery) {
    if (comments) return comments;
    const myQuery = await MyQuery.findOne(id, {
      relations: ["comments"],
    });
    return myQuery?.comments;
  }

  @FieldResolver(() => Number, { description: "get number of likes" })
  async likeCount(@Root() { id, likedBy }: MyQuery) {
    if (likedBy) return likedBy.length;
    const myQuery = await MyQuery.findOne(id, { relations: ["likedBy"] });
    const like_count = myQuery?.likedBy.length;
    return like_count;
  }

  @FieldResolver(() => Number)
  async reportCount(@Root() { id, reports }: MyQuery) {
    try {
      if (reports) return reports.length;
      const netop = await MyQuery.findOne({
        where: id,
        relations: ["reports"],
      });
      return netop?.reports.length;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Boolean, {
    description: "check if Query is liked by current user",
  })
  async isLiked(@Root() { id, likedBy }: MyQuery, @Ctx() { user }: MyContext) {
    if (likedBy) return likedBy.filter((u) => u.id === user.id).length;
    const myQuery = await MyQuery.findOne(id, {
      relations: ["likedBy"],
    });
    return myQuery?.likedBy.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: MyQuery) {
    if (createdBy) return createdBy;
    const myQuery = await MyQuery.findOne(id, { relations: ["createdBy"] });
    return myQuery?.createdBy;
  }

  @FieldResolver(() => [Report], {
    nullable: true,
    description: "get list of reports",
  })
  async reports(@Root() { id, reports }: MyQuery) {
    if (reports) return reports;
    const myQuery = await MyQuery.findOne(id, {
      relations: ["reports"],
    });
    return myQuery?.reports;
  }

  @FieldResolver(() => Number)
  async commentCount(@Root() { id, comments }: MyQuery) {
    if (comments) return comments.length;
    const myQuerys = await MyQuery.findOneOrFail(id, {
      relations: ["comments"],
    });
    return myQuerys.comments.length;
  }

  @FieldResolver(() => [EditDelPermission])
  async permissions(
    @Ctx() { user }: MyContext,
    @Root() { id, permissions }: MyQuery
  ) {
    try {
      if (permissions) return permissions;
      const permissionList: EditDelPermission[] = [
        EditDelPermission.COMMENT,
        EditDelPermission.REPORT,
      ];
      const query = await MyQuery.findOne(id, { relations: ["createdBy"] });
      if (user.id === query?.createdBy.id)
        permissionList.push(EditDelPermission.EDIT, EditDelPermission.DELETE);
      if (
        [
          UserRole.ADMIN,
          UserRole.SECRETARY,
          UserRole.HAS,
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

export default MyQueryResolver;
