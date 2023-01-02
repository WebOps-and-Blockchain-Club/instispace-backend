import {
  Authorized,
  Mutation,
  Resolver,
  Query,
  Arg,
  FieldResolver,
  Root,
  Ctx,
} from "type-graphql";
import TagInput from "../types/inputs/tags";
import Tag from "../entities/Tag";
import User from "../entities/User";
import { PostStatus, UserRole } from "../utils";
import Netop from "../entities/Netop";
import Event from "../entities/Event";
import MyContext from "../utils/context";
import { ILike } from "typeorm";

@Resolver((_type) => Tag)
class TagsResolver {
  @Mutation(() => Boolean, {
    description: "Mutation to Create Tags, Restrictions : {Admin}",
  })
  @Authorized([
    UserRole.ADMIN,
    UserRole.SECRETARY,
    UserRole.HAS,
    UserRole.LEADS,
  ])
  async createTag(@Arg("TagInput") { title, category }: TagInput) {
    try {
      const existingTag = await Tag.findOne({ where: { title: ILike(title) } });
      if (existingTag) throw new Error(`Tag already exists`);
      const newTag = new Tag();
      newTag.title = title;
      newTag.category = category;
      await newTag.save();
      return !!newTag;
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

  @Query(() => [String], {
    description:
      "Query to return the tag categories, Restrictions : {anyone who is authorized}",
  })
  @Authorized()
  async getCategories() {
    const categories = ["Sports", "Cultural", "Academics", "Technical"];
    return categories;
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

  @FieldResolver(() => [Netop], { nullable: true })
  async netops(@Root() { id, netops }: Tag, @Ctx() { user }: MyContext) {
    const d = new Date();
    if (netops) {
      const ns = netops.filter(
        (n) =>
          !n.isHidden &&
          new Date(n.endTime).getTime() > d.getTime() &&
          n.reports.filter((nr) => nr.createdBy.id === user.id).length === 0 &&
          [
            PostStatus.POSTED,
            PostStatus.REPORTED,
            PostStatus.REPORT_REJECTED,
          ].includes(n.status)
      );
      return ns;
    }

    const tag = await Tag.findOne(id, {
      relations: ["netops", "netops.reports", "netops.reports.createdBy"],
    });
    if (tag?.netops) {
      const ns = tag.netops.filter(
        (n) =>
          !n.isHidden &&
          new Date(n.endTime).getTime() > d.getTime() &&
          n.reports.filter((nr) => nr.createdBy.id === user.id).length === 0 &&
          [
            PostStatus.POSTED,
            PostStatus.REPORTED,
            PostStatus.REPORT_REJECTED,
          ].includes(n.status)
      );
      return ns;
    }
    return null;
  }

  @FieldResolver(() => [Event], { nullable: true })
  async events(@Root() { id, event }: Tag) {
    const d = new Date();
    d.setHours(d.getHours() - 2); //Filter the events after the 2 hours time of completion

    if (event) {
      const ns = event.filter(
        (n) => !n.isHidden && new Date(n.time).getTime() > d.getTime()
      );
      return ns;
    }

    const tag = await Tag.findOne(id, { relations: ["event"] });
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
