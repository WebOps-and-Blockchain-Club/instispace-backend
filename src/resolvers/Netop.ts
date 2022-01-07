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
import { UserRole } from "../utils";
import Report from "../entities/Common/Report";
import addAttachments from "../utils/uploads";

@Resolver(Netop)
class NetopResolver {
  @Mutation(() => Boolean, {
    description:
      "create network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createNetop(
    @Arg("NewEventData") createNetopsInput: createNetopsInput,
    @Ctx() { user }: MyContext,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ) {
    try {
      var tags: Tag[] = [];
      await Promise.all(
        createNetopsInput.tags.map(async (id) => {
          const tag = await Tag.findOne(id, { relations: ["Netops"] });
          if (tag) {
            tags = tags.concat([tag]);
          }
        })
      );

      if (image)
        createNetopsInput.photo = (await addAttachments([image], true)).join(
          " AND "
        );
      if (attachments)
        createNetopsInput.attachments = (
          await addAttachments([...attachments], false)
        ).join(" AND ");

      const netop = Netop.create({
        ...createNetopsInput,
        createdBy: user,
        isHidden: false,
        endTime: new Date(createNetopsInput.endTime),
        likeCount: 0,
        tags,
      });

      await netop.save();
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
    @Arg("EditNetopsData") editNetopsInput: editNetopsInput,
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("Tags", () => [String], { nullable: true }) Tags?: string[],
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["tags", "createdBy"],
      });

      if (netop && user.id === netop?.createdBy.id) {
        if (Tags) {
          var tags: Tag[] = [];
          await Promise.all(
            Tags.map(async (id) => {
              const tag = await Tag.findOne(id, { relations: ["Netops"] });
              if (tag) {
                tags = tags.concat([tag]);
              }
            })
          );
        }

        if (image)
          editNetopsInput.photo = (await addAttachments([image], true)).join(
            " AND "
          );
        if (attachments)
          editNetopsInput.attachments = (
            await addAttachments([...attachments], false)
          ).join(" AND ");

        const { affected } = await Netop.update(netopId, {
          ...editNetopsInput,
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
    description:
      "edit network and opportunity, Restrictions:{user who created}",
  })
  @Authorized()
  async deleteNetop(@Arg("NetopId") netopId: string) {
    try {
      const { affected } = await Netop.update(netopId, { isHidden: true });
      return affected === 1;
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
  async toggleLike(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["likedBy"] });
      if (netop) {
        if (netop.likedBy.filter((u) => u.id === user.id).length) {
          netop.likedBy = netop.likedBy.filter((e) => e.id !== user.id);
          await netop.save();
        } else {
          netop.likedBy.push(user);
          await netop.save();
        }
        return !!netop;
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
      if (netop) {
        if (netop.staredBy.filter((u) => u.id === user.id).length) {
          netop.staredBy = netop.staredBy.filter((e) => e.id !== user.id);
          await netop.save();
        } else {
          netop.staredBy.push(user);
          await netop.save();
        }
        return !!netop;
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
      const netop = await Netop.findOne(netopId, { relations: ["reports"] });
      if (netop) {
        const report = Report.create({ netop, description, createdBy: user });
        await report.save();
        console.log(report);
        return !!report;
      } else {
        console.log("netop not found");
        return false;
      }
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
  async createComment(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("content") content: string
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["comments"] });
      if (netop) {
        const comment = Comment.create({ content, netop, createdBy: user });
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
  async removeNetop(@Arg("NetopId") netopId: string) {
    let { affected } = await Netop.update(netopId, { isHidden: true });
    return affected === 1;
  }

  @Query(() => Netop, {
    description: "get an netop by id network and opportunity",
  })
  @Authorized()
  async getNetop(@Arg("NetopId") netopId: string) {
    try {
      const netop = await Netop.findOne(netopId, {
        where: { isHidden: false },
      });
      return netop;
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
    @Arg("take") take: number,
    @Arg("skip") skip: number,
    @Arg("FileringCondition", { nullable: true })
    fileringConditions?: fileringConditions,
    @Arg("OrderByLikes", () => Boolean, { nullable: true })
    orderByLikes?: Boolean
  ) {
    try {
      var netopList = await Netop.find({
        where: { isHidden: false },
        relations: ["tags", "likedBy"],
        order: { createdAt: "DESC" },
      });

      const d = new Date();
      if (fileringConditions) {
        if (fileringConditions.isStared) {
          netopList = netopList.filter(
            (n) =>
              n.isStared &&
              new Date(n.endTime).getTime() > d.getTime() &&
              n.tags.filter((tag) => fileringConditions.tags.includes(tag.id))
                .length
          );
        } else {
          netopList = netopList.filter(
            (n) =>
              new Date(n.endTime).getTime() > d.getTime() &&
              n.tags.filter((tag) => fileringConditions.tags.includes(tag.id))
                .length
          );
        }
      } else {
        netopList = netopList.filter(
          (n) => new Date(n.endTime).getTime() > d.getTime()
        );
      }

      const total = netopList.length;

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

      const finalList = netopList.splice(skip, take);

      return { netopList: finalList, total };
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Query(() => [Report], { nullable: true })
  async getReports() {
    return await Report.find({});
  }

  @Query(() => Boolean, {
    description: "check if network and opportunity is liked by current user",
  })
  async isLiked(@Arg("NetopId") netopId: string, @Ctx() { user }: MyContext) {
    const netop = await Netop.findOne(netopId, { relations: ["likedBy"] });
    return netop?.likedBy.filter((u) => u.id === user.id).length;
  }

  @FieldResolver(() => [Comment], {
    nullable: true,
    description: "get list of comments",
  })
  async comments(@Root() { id }: Netop) {
    const netop = await Netop.findOne(id, {
      relations: ["comments"],
    });
    return netop?.comments;
  }

  @FieldResolver(() => Number, { description: "get number of likes" })
  async likeCount(@Root() { id }: Netop) {
    const netop = await Netop.findOne(id, { relations: ["likedBy"] });
    const like_count = netop?.likedBy.length;
    return like_count;
  }

  @FieldResolver(() => [Tag], {
    nullable: true,
    description: "get all the tags associated",
  })
  async tags(@Root() { id }: Netop) {
    const netop = await Netop.findOne(id, {
      relations: ["tags"],
    });
    return netop?.tags;
  }

  @FieldResolver(() => Boolean, {
    description: "check if network and opportunity is stared by current user",
  })
  async isStared(@Arg("NetopId") netopId: string, @Ctx() { user }: MyContext) {
    const netop = await Netop.findOne(netopId, { relations: ["staredBy"] });
    return netop?.staredBy.filter((u) => u.id === user.id).length;
  }
}

export default NetopResolver;
