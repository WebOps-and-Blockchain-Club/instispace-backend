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
  @Authorized([UserRole.ADMIN])
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
    if (netops) return netops;
    const tag = await Tag.findOne(id, { relations: ["netops"] });
    return tag?.netops;
  }

  @FieldResolver(() => [Event])
  async events(@Root() { id, event }: Tag) {
    if (event) return event;
    const tag = await Tag.findOne(id, { relations: ["event"] });
    return tag?.event;
  }
}
export default TagsResolver;
