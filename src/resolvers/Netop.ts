//TODO: tag as id
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
import { createNetopsInput, editNetopsInput } from "../types/inputs/netop";
import Tag from "../entities/Tag";
import Netop from "../entities/Netop";
import Comment from "../entities/Common/Comment";
import getNetopOutput from "../types/objects/netop";

@Resolver(Netop)
class NetopResolver {
  @Mutation(() => Boolean, {
    description:
      "create network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createNetop(
    @Arg("NewEventData") createNetopsInput: createNetopsInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      //TODO: tags are not get added here
      const { title, content, photo, endTime } = createNetopsInput;

      var tags: Tag[] = [];
      await Promise.all(
        createNetopsInput.tags.map(async (id) => {
          const tag = await Tag.findOne(id, { relations: ["Netops"] });
          if (tag) {
            tags = tags.concat([tag]);
          }
        })
      );

      const netop = Netop.create({
        title,
        content,
        photo,
        createdBy: user,
        isHidden: false,
        likeCount: 0,
        tags,
        endTime,
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
    @Arg("Tags", () => [String], { nullable: true }) Tags?: string[]
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["tags", "createdBy"],
      });

      if (netop && user.id === netop?.createdBy.id) {
        if (Tags) {
          netop.tags = [];
          Tags.forEach(async (id) => {
            const tag = await Tag.findOne(id);
            if (tag) netop.tags.push(tag);
          });
        }

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

  @Mutation(() => Boolean)
  @Authorized({
    description:
      "star or unstar (if it's previously star) network and opportunity, Restrictions:{any authorized user}",
  })
  async toggleStar(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["staredBy"] });
      if (netop) {
        if (netop.staredBy.filter((u) => u.id === user.id).length) {
          // if it's stared then unstar
          netop.staredBy = netop.staredBy.filter((e) => e.id !== user.id);
          await netop.save();
        } else {
          // else star
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
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["reportedBy"] });
      if (netop) {
        if (!netop.reportedBy.filter((u) => u.id === user.id).length) {
          netop.reportedBy.push(user);
          // TODO: inform to moderators
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

  @Query(() => Netop, {
    description: "get an netop by id network and opportunity",
  })
  @Authorized()
  async getNetopById(@Arg("NetopId") netopId: string) {
    try {
      // const netop = await Netop.findOne(netopId, { relations: ["createdBy"] })
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
  async getNetop(
    @Arg("take") take: number,
    @Arg("skip") skip: number,
    @Arg("FileringCondition", () => [String], { nullable: true })
    fileringConditions?: string[],
    @Arg("OrderByLikes", (_type) => Boolean, { nullable: true })
    orderByLikes?: Boolean
  ) {
    try {
      var netopList = await Netop.find({
        where: { isHidden: false },
        relations: ["tags", "likedBy"],
        order: { createdAt: "DESC" },
      });

      console.log(orderByLikes);

      if (fileringConditions) {
        netopList = netopList.filter(
          (n) =>
            n.endTime < Date.now() &&
            n.tags.filter((tag) => fileringConditions.includes(tag.id)).length
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

  @Query(() => Boolean, {
    description: "check if network and opportunity is stared by current user",
  })
  async isStared(@Arg("NetopId") netopId: string, @Ctx() { user }: MyContext) {
    const netop = await Netop.findOne(netopId, { relations: ["staredBy"] });
    return netop?.staredBy.filter((u) => u.id === user.id).length;
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

  @FieldResolver(() => Number, { description: "get number of likes" })
  async reportCount(@Root() { id }: Netop) {
    const netop = await Netop.findOne(id, { relations: ["reportedBy"] });
    const report_count = netop?.reportedBy.length;
    return report_count;
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
}

export default NetopResolver;

//*** My Helpers */
// function compare(a: Netop, b: Netop) {
//   if (a.likeCount < b.likeCount) {
//     return 1;
//   }
//   if (a.likeCount > b.likeCount) {
//     return -1;
//   }
//   return 0;
// }
