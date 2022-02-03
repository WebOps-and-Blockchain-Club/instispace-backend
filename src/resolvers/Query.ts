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
import { UserRole } from "../utils";
import Report from "../entities/Common/Report";
import addAttachments from "../utils/uploads";
import User from "../entities/User";

@Resolver(MyQuery)
class MyQueryResolver {
  @Mutation(() => Boolean, {
    description: "create Query, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createMyQuery(
    @Arg("createQuerysInput") createMyQuerysInput: createQuerysInput,
    @Ctx() { user }: MyContext,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ): Promise<boolean> {
    try {
      if (image)
        createMyQuerysInput.photo = (await addAttachments([image], true)).join(
          " AND "
        );
      if (attachments)
        createMyQuerysInput.attachments = (
          await addAttachments([...attachments], false)
        ).join(" AND ");

      const myQuery = MyQuery.create({
        ...createMyQuerysInput,
        createdBy: user,
        isHidden: false,
        likeCount: 0,
      });

      await myQuery.save();
      return !!myQuery;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "edit Query, Restrictions:{user who created}",
  })
  @Authorized()
  async editMyQuery(
    @Arg("EditMyQuerysData") editMyQuerysInput: editQuerysInput,
    @Arg("MyQueryId") myQueryId: string,
    @Ctx() { user }: MyContext,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ) {
    try {
      const myQuery = await MyQuery.findOne(myQueryId, {
        relations: ["tags", "createdBy"],
      });

      if (myQuery && user.id === myQuery?.createdBy.id) {
        if (image)
          editMyQuerysInput.photo = (await addAttachments([image], true)).join(
            " AND "
          );
        if (attachments)
          editMyQuerysInput.attachments = (
            await addAttachments([...attachments], false)
          ).join(" AND ");

        const { affected } = await MyQuery.update(myQueryId, {
          ...editMyQuerysInput,
        });
        return affected === 1;
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
  async deleteMyQuery(@Arg("MyQueryId") myQueryId: string) {
    try {
      const { affected } = await MyQuery.update(myQueryId, { isHidden: true });
      return affected === 1;
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
      if (myQuery) {
        if (myQuery.likedBy.filter((u) => u.id === user.id).length) {
          myQuery.likedBy = myQuery.likedBy.filter((e) => e.id !== user.id);
          await myQuery.save();
        } else {
          myQuery.likedBy.push(user);
          await myQuery.save();
        }
        return !!myQuery;
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
      const myQuery = await MyQuery.findOne(myQueryId, {
        relations: ["reports"],
      });
      if (myQuery) {
        const report = Report.create({
          query: myQuery,
          description,
          createdBy: user,
        });
        await report.save();
        return !!report;
      } else {
        return false;
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean, {
    description: "comment on Query, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createCommentQuery(
    @Arg("MyQueryId") myQueryId: string,
    @Ctx() { user }: MyContext,
    @Arg("content") content: string
  ) {
    try {
      const myQuery = await MyQuery.findOne(myQueryId, {
        relations: ["comments"],
      });
      if (myQuery) {
        const comment = Comment.create({
          content,
          query: myQuery,
          createdBy: user,
        });
        await comment.save();
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
    UserRole.HOSTEL_SEC,
  ])
  async removeMyQuery(@Arg("MyQueryId") myQueryId: string) {
    let { affected } = await MyQuery.update(myQueryId, { isHidden: true });
    return affected === 1;
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
    @Arg("skip") skip: number,
    @Arg("OrderByLikes", () => Boolean, { nullable: true })
    orderByLikes?: Boolean
  ) {
    try {
      var myQueryList = await MyQuery.find({
        where: { isHidden: false },
        relations: ["likedBy"],
        order: { createdAt: "DESC" },
      });

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

      const finalList = myQueryList.splice(skip, take);

      return { queryList: finalList, total };
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
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
}

export default MyQueryResolver;
