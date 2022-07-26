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
import { EditDelPermission, smail, UserRole } from "../utils";
import Report from "../entities/Common/Report";
import addAttachments from "../utils/uploads";
import User from "../entities/User";
import fcm from "../utils/fcmTokens";
import { ILike, In } from "typeorm";
import { mail } from "../utils/mail";

@Resolver(MyQuery)
class MyQueryResolver {
  @Mutation(() => MyQuery, {
    description: "create Query, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createMyQuery(
    @Arg("createQuerysInput") createMyQuerysInput: createQuerysInput,
    @Ctx() { user }: MyContext,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[],
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ): Promise<MyQuery> {
    try {
      if (images)
        createMyQuerysInput.photo = (
          await addAttachments([...images], true)
        ).join(" AND ");

      if (attachments)
        createMyQuerysInput.attachments = (
          await addAttachments([...attachments], false)
        ).join(" AND ");

      const myQuery = await MyQuery.create({
        ...createMyQuerysInput,
        createdBy: user,
        isHidden: false,
        likeCount: 0,
      }).save();

      return myQuery;
    } catch (e) {
      console.log(e.message);
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
    @Ctx() { user }: MyContext,
    @Arg("Image", () => [GraphQLUpload], { nullable: true }) images?: Upload[],
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
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
        if (images) {
          editMyQuerysInput.photo = (
            await addAttachments([...images], true)
          ).join(" AND ");
          myQuery.photo = editMyQuerysInput.photo;
        }
        if (attachments) {
          editMyQuerysInput.attachments = (
            await addAttachments([...attachments], false)
          ).join(" AND ");
          myQuery.attachments = editMyQuerysInput.attachments;
        }
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
      console.log(e.message);
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
      console.log(e.message);
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
    @Arg("description") description: string
  ) {
    try {
      const myQuery = await MyQuery.findOneOrFail(myQueryId, {
        relations: ["reports", "createdBy"],
      });
      const report = await Report.create({
        query: myQuery,
        description,
        createdBy: user,
      }).save();

      const { affected } = await MyQuery.update(myQueryId, { isHidden: true });

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
          htmlContent: "Query you made, got reported!",
        });
      }

      if (!!report && affected) {
        const creator = myQuery.createdBy;

        creator.fcmToken.split(" AND ").map((ft) => {
          const message = {
            to: ft,
            notification: {
              title: `Hi ${creator.roll}`,
              body: "your query got reported",
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

        const creator = await User.findOneOrFail(myQuery.createdBy.id);

        if (!!comment && creator.notifyMyQuery) {
          creator.fcmToken &&
            creator.fcmToken.split(" AND ").map(async (ft) => {
              const message = {
                to: ft,
                notification: {
                  title: `Hi ${creator.name}`,
                  body: "your query got responsed",
                },
              };

              await fcm.send(message, (err: any, response: any) => {
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
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  /*
  @Mutation(() => Boolean)
  @Authorized([
    UserRole.ADMIN,
    UserRole.SECRETORY,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
  ])
  async removeMyQuery(
    @Arg("MyQueryId") myQueryId: string,
    @Arg("ReportId") reportId: string
  ) {
    let { affected } = await MyQuery.update(myQueryId, { isHidden: true });
    let { affected: a2 } = await Report.update(reportId, { isResolved: true });

    if (affected === 1 && a2 === 1) {
      let myQuery = await MyQuery.findOneOrFail(myQueryId);

      const creator = myQuery.createdBy;

      creator.fcmToken.split(" AND ").map((ft) => {
        const message = {
          to: ft,
          notification: {
            title: `Hi ${creator.roll}`,
            body: "your query got reported",
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
    UserRole.SECRETORY,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
  ])
  async resolveMyQuery(
    @Arg("MyQueryId") myQueryId: string,
    @Arg("ReportId") reportId: string
  ) {
    let { affected } = await MyQuery.update(myQueryId, { isHidden: false });
    let { affected: a2 } = await Report.update(reportId, { isResolved: true });
    if (affected === 1 && a2 === 1) {
      let myQuery = await MyQuery.findOneOrFail(myQueryId);

      const creator = myQuery.createdBy;

      creator.fcmToken.split(" AND ").map((ft) => {
        const message = {
          to: ft,
          notification: {
            title: `Hi ${creator.roll}`,
            body: "your query got resolved and now its displayed",
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
*/

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
      console.log(e.message);
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
    @Arg("OrderByLikes", () => Boolean, { nullable: true })
    orderByLikes?: Boolean,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      var myQueryList: MyQuery[] = [];
      if (search) {
        await Promise.all(
          ["title"].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`), isHidden: false };
            const queryF = await MyQuery.find({
              where: filter,
              relations: ["likedBy"],
              order: { createdAt: "DESC" },
            });
            queryF.forEach((query) => {
              myQueryList.push(query);
            });
          })
        );
      } else {
        myQueryList = await MyQuery.find({
          where: { isHidden: false },
          relations: ["likedBy"],
          order: { createdAt: "DESC" },
        });
      }

      const total = myQueryList.length;

      if (orderByLikes) {
        myQueryList.sort((a, b) =>
          a.likedBy.length > b.likedBy.length
            ? -1
            : a.likedBy.length < b.likedBy.length
            ? 1
            : 0
        );
      } else {
        myQueryList.sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
        );
      }

      var finalList;

      if (lastEventId) {
        const index = myQueryList.map((n) => n.id).indexOf(lastEventId);
        finalList = myQueryList.splice(index + 1, take);
      } else {
        finalList = myQueryList.splice(0, take);
      }

      return { queryList: finalList, total };
    } catch (e) {
      console.log(e.message);
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

  @FieldResolver(() => [Comment], {
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
          UserRole.SECRETORY,
          UserRole.HAS,
          UserRole.HOSTEL_SEC,
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
