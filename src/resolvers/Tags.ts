import { Authorized, Mutation, Resolver, Query, Arg, FieldResolver, Root } from "type-graphql";
import TagInput from "../types/inputs/tags";
import Tag from "../entities/Tag";
import User from "../entities/User";

@Resolver(_type => Tag)
class TagsResolver {
  @Mutation(() => Boolean)
  @Authorized(["ADMIN"])
  async createTag(@Arg("TagInput") { title }: TagInput) {
    const findTag = await Tag.findOne({ where: { title } });
    if (findTag) throw new Error("Tag Alraedy Exits");
    const tag = new Tag();
    tag.title = title;
    await tag.save();
    return !!tag;
  }

  @Query(() => [Tag])
  @Authorized()
  async getTags() {
    return await Tag.find();
  }

  @FieldResolver(() => [User])
  async users(@Root() {id} : Tag){
    const tag = await Tag.findOne({where : {id} , relations : ["users"]});
    return tag?.users;
  }
}
export default TagsResolver;
