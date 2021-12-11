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

@Resolver((_type) => Tag)
class TagsResolver {
  @Mutation(() => Boolean)
  @Authorized(["ADMIN"])
  async createTag(@Arg("TagInput") { title }: TagInput) {
    try {
      const tag = new Tag();
      tag.title = title;
      await tag.save();
      return !!tag;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Tag])
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
}
export default TagsResolver;
