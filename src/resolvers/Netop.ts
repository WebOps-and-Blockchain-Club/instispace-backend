import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";

import MyContext from "../utils/context";
import createNetopsInput from "../types/inputs/netop";
import Tag from "../entities/Tag";
import Netop from "../entities/Netop";
@Resolver()
class NetopResolver {
  @Mutation(() => Boolean)
  @Authorized()
  async createPost(
    @Arg("NewEventData") createNetopsInput: createNetopsInput,
    @Ctx() { user }: MyContext
  ) {
    try {
      const { title, content, photo } = createNetopsInput;

      const netop = Netop.create({
        title,
        content,
        photo,
        createdBy: user,
        isHidden: false,
      });

      createNetopsInput.tags.forEach(async (tagName) => {
        const tag = await Tag.findOne({ title: tagName });
        if (tag) netop.tags.push(tag);
      });

      netop.save();
      return !!netop;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async editEvent(
    @Arg("EditNetopsData") editNetopsInput: createNetopsInput,
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId);
      if (netop && user === netop.createdBy) {
        const { title, content, photo } = editNetopsInput;
        const { affected } = await Netop.update(netopId, {
          ...netop,
          title,
          content,
          photo,
        });
        return affected === 1;
      } else {
        throw new Error("Unauthorized");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async editTags(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext,
    @Arg("Tags") Tags: string[]
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["tags"] });
      if (netop && user === netop.createdBy) {
        Tags.forEach(async (tagName) => {
          const tag = await Tag.findOne({ title: tagName });
          if (tag) netop.tags.push(tag);
        });

        netop.save();
        return !!netop;
      } else {
        throw new Error("Unauthorized");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async deleteEvent(@Arg("NetopId") netopId: string) {
    try {
      const { affected } = await Netop.update(
        { id: netopId },
        { isHidden: true }
      );
      return affected === 1;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async toggleLike(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["likedBy"] });
      if (netop) {
        if (netop.likedBy.includes(user)) {
          netop.likedBy.filter((e) => e !== user);
          netop.save();
        } else {
          netop.likedBy.push(user);
          netop.save();
        }
        return netop!!;
      } else {
        throw new Error("Invalid netop id");
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async toggleStar(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["staredBy"] });
      if (netop) {
        if (netop.staredBy.includes(user)) {
          netop.staredBy.filter((e) => e !== user);
          netop.save();
        } else {
          netop.staredBy.push(user);
          netop.save();
        }
        return netop!!;
      } else {
        throw new Error("Invalid netop id");
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async reportNetop(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["reportedBy"] });
      if (netop) {
        if (!netop.reportedBy.includes(user)) {
          netop.reportedBy.push(user);
          // TODO: inform to moderators
          netop.save();
        }
        return netop!!;
      } else {
        throw new Error("Invalid netop id");
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async addComment(
    @Arg("NetopId") netopId: string,
    @Ctx() { user }: MyContext
    @Arg("createCommentData") createCommentData:createCommentData
  ) {
    try {
      const netop = await Netop.findOne(netopId, { relations: ["likedBy"] });
      if (netop) {
        if (netop.likedBy.includes(user)) {
          netop.likedBy.filter((e) => e !== user);
          netop.save();
        } else {
          netop.likedBy.push(user);
          netop.save();
        }
        return netop!!;
      } else {
        throw new Error("Invalid netop id");
      }
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Query(() => Netop)
  @Authorized()
  async getNetopById(@Arg("NetopId") netopId: string) {
    try {
      const netop = await Netop.findOne(netopId);
      return netop;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Query(() => [Netop])
  @Authorized()
  async getNetop(
    @Arg("FileringCondition", { nullable: true }) fileringConditions: string[],
    @Arg("SortingCondition", { nullable: true }) sortingCondition: string
  ) {
    try {
      var netopList = await Netop.find({
        where: { isHidden: false },
        relations: ["tags"],
      });
      if (fileringConditions) {
        var newList: Netop[] = [];
        fileringConditions.forEach(async (tagName) => {
          var tag = await Tag.findOne({ title: tagName });
          if (tag) {
            // still duplicates will be there
            newList.concat(netopList.filter((e) => e.tags.includes(tag!)));
          }
        });
        newList = arrayUnique(newList);
        netopList = newList;
      }
      const MOSTLIKED = "mostLiked";
      const MOSTRECENT = "mostRecent";
      // const MOSTRELEVANT= "mostRelevant";

      switch (sortingCondition) {
        case MOSTLIKED:
          netopList.sort((a, b) => b.noOfLikes - a.noOfLikes);
          break;
        case MOSTRECENT:
          // newList.sort((a, b) => b.time - a.time);
          break;
        default:
          // mostRelavant
          break;
      }

      return netopList;
    } catch (e) {
      console.log(e.message);
      throw new Error(e.message);
    }
  }

  @Query(() => Comment)
  async getComment(@Arg("netopId") netopId: string) {
    const netop = await Netop.findOne(netopId, {
      relations: ["comments"],
    });
    return netop?.comments;
  }

  // @Mutation(() => Boolean)
  // async createPost(
  //   @Arg("title") title: string,
  //   @Arg("content") content: string,
  //   @Ctx() { user }: MyContext
  // ) {
  //   const Netop = Netop.create({
  //     title,
  //     content,
  //     createdBy: user,
  //     isHidden: false,
  //   });
  //   Netop.save();
  //   return !!Netop;
  // }

  //ToDo: edit Netop from debo
  // @Mutation(() => Boolean)
  // async editPost(
  //   @Arg("postId") postId: string,
  //   @Arg("newPost") newPost: Netop
  // ) {
  //   const Netop = await Netop.update(postId, newPost);
  //   Netop.save();

  //   return !!Netop;
  // }
}

export default NetopResolver;

//*** My Helpers */
function arrayUnique(array: Netop[]): Netop[] {
  var a = array.concat();
  for (var i = 0; i < a.length; ++i) {
    for (var j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) a.splice(j--, 1);
    }
  }

  return a;
}
