import {
  Authorized,
  Mutation,
  Resolver,
  Query,
  Arg,
  FieldResolver,
  Root,
} from "type-graphql";
import TagInput from "../types/inputs/tags";
import Tag from "../entities/Tag";
import User from "../entities/User";
import { UserRole } from "../utils";
import Netop from "../entities/Netop";
import Event from "../entities/Event";

@Resolver((_type) => Tag)
class TagsResolver {
  @Mutation(() => Boolean, {
    description: "Mutation to Create Tags, Restrictions : {Admin}",
  })
  @Authorized([UserRole.ADMIN, UserRole.SECRETORY, UserRole.HAS])
  async createTag(@Arg("TagInput") { title, category }: TagInput) {
    try {
      const tag = new Tag();
      tag.title = title;
      tag.category = category;
      await tag.save();
      return !!tag;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Tag], {
    description:
      "Query to Fetch all the tags, Restrictions : {anyone who is authorized}",
  })
  @Authorized()
  async getTags() {
    try {
      return await Tag.find();
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => Tag, {
    description:
      "Query to Fetch the tag, Restrictions : {anyone who is authorized}",
  })
  @Authorized()
  async getTag(@Arg("Tag") tagId: string) {
    try {
      return await Tag.findOne(tagId);
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [User])
  async users(@Root() { id }: Tag) {
    try {
      const tag = await Tag.findOne({ where: { id }, relations: ["users"] });
      return tag?.users;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [Netop])
  async netops(@Root() { id, netops }: Tag) {
    if (netops) {
      const d = new Date();
      if (netops) {
        const ns = netops.filter(
          (n) => !n.isHidden && new Date(n.endTime).getTime() > d.getTime()
        );
        return ns;
      }
      return null;
    }
    const tag = await Tag.findOne(id, { relations: ["netops"] });
    const d = new Date();
    if (tag?.netops) {
      const ns = tag.netops.filter(
        (n) => !n.isHidden && new Date(n.endTime).getTime() > d.getTime()
      );
      return ns;
    }
    return null;
  }

  @FieldResolver(() => [Event])
  async events(@Root() { id, event }: Tag) {
    if (event) {
      const d = new Date();
      if (event) {
        const ns = event.filter(
          (n) => !n.isHidden && new Date(n.time).getTime() > d.getTime()
        );
        return ns;
      }
      return null;
    }
    const tag = await Tag.findOne(id, { relations: ["event"] });
    const d = new Date();
    if (tag?.event) {
      const ns = tag.event.filter(
        (n) => !n.isHidden && new Date(n.time).getTime() > d.getTime()
      );
      return ns;
    }
    return null;
  }
}
export default TagsResolver;
