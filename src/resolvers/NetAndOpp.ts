import { Query, Resolver } from "type-graphql";

import NetwokingAndOpporunity from "../entities/Netwoking_and_opporunity";
import Comment from "../entities/Common/Comment";

@Resolver()
class NetwokingAndOpporunityResolver {
  @Query(() => [NetwokingAndOpporunity])
  async getAllPosts() {
    const posts = await NetwokingAndOpporunity.find({});
    return posts;
  }

  @Query(() => NetwokingAndOpporunity)
  async getPost(postId: string) {
    const post = await NetwokingAndOpporunity.findOne(postId);
    return post;
  }

  @Query(() => Comment)
  async getComment(postId: string) {
    const post = await NetwokingAndOpporunity.findOne(postId, {
      relations: ["comments"],
    });
    return post?.comments;
  }
}

export default NetwokingAndOpporunityResolver;
