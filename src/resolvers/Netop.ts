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
import User from "../entities/User";

@Resolver(Netop)
class NetopResolver {
  @Query(() => Boolean)
  async isInterested(@Ctx() { user }: MyContext, @Arg("tag") tag: string) {
    if (user.interest) {
      user.interest.filter((interest) => {
        console.log(interest.id, tag);
        return interest.id == tag;
      });
      return !!user;
    } else {
      const u = await User.findOne(user.id, { relations: ["interest"] });
      var t = u?.interest?.filter((interest) => {
        console.log(interest.id, tag);
        return interest.id == tag;
      });
      return !!t;
    }
  }

  @Mutation(() => Boolean, {
    description:
      "create network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createNetop(
    @PubSub() pubSub: PubSubEngine,
    @Arg("NewEventData") createNetopsInput: createNetopsInput,
    @Ctx() { user }: MyContext,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ): Promise<boolean> {
    try {
      var tags: Tag[] = [];
      await Promise.all(
        createNetopsInput.tags.map(async (id) => {
          const tag = await Tag.findOne(id, { relations: ["netops"] });
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

      const netop = await Netop.create({
        ...createNetopsInput,
        createdBy: user,
        isHidden: false,
        endTime: new Date(createNetopsInput.endTime),
        likeCount: 0,
        tags,
      }).save();

      const payload = netop;
      let isUserInterested: boolean | undefined = false;
      await Promise.all(
        tags.map(async (t) => {
          isUserInterested = await this.isInterested({ user }, t.id);
        })
      );
      console.log(isUserInterested);

      if (isUserInterested) {
        await pubSub.publish("NETOP", payload);
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
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload,
    @Arg("Attachments", () => [GraphQLUpload], { nullable: true })
    attachments?: Upload[]
  ) {
    try {
      const netop = await Netop.findOne(netopId, {
        relations: ["tags", "createdBy"],
      });

      if (
        netop &&
        (user.id === netop?.createdBy.id ||
          [
            UserRole.ADMIN,
            UserRole.LEADS,
            UserRole.HAS,
            UserRole.SECRETORY,
            UserRole.HOSTEL_SEC,
            UserRole.MODERATOR,
          ].includes(user.role))
      ) {
        if (image)
          editNetopsInput.photo = (await addAttachments([image], true)).join(
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
      const netop = await Netop.findOne(netopId, { relations: ["reports"] });
      if (netop) {
        const report = await Report.create({
          netop,
          description,
          createdBy: user,
        }).save();
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
    description:
      "comment on network and opportunity, Restrictions:{any authorized user}",
  })
  @Authorized()
  async createCommentNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("content") content: string
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["comments"] });
      if (netop) {
        const comment = await Comment.create({
          content,
          netop,
          createdBy: user,
        }).save();
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

      const d = new Date();
      if (netop && new Date(netop.endTime).getTime() > d.getTime())
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
    orderByLikes?: Boolean
  ) {
    try {
      var netopList = await Netop.find({
        where: { isHidden: false },
        relations: ["tags", "likedBy", "staredBy"],
        order: { createdAt: "DESC" },
      });

      const d = new Date();
      if (fileringConditions && fileringConditions.isStared) {
        netopList = netopList.filter((n) => {
          return fileringConditions.tags
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

      var finalList;

      if (lastNetopId) {
        const index = netopList.map((n) => n.id).indexOf(lastNetopId);
        finalList = netopList.splice(index + 1, take);
      } else {
        finalList = netopList;
      }

      return { netopList: finalList, total };
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
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

  @FieldResolver(() => User)
  async createdBy(@Root() { id, createdBy }: Netop) {
    if (createdBy) return createdBy;
    const netop = await Netop.findOne(id, { relations: ["createdBy"] });
    return netop?.createdBy;
  }

  @Subscription({ topics: "NETOP" })
  createNetop2(@Root() netop: Netop): Netop {
    console.log(netop.title);
    return netop;
  }
}

export default NetopResolver;
