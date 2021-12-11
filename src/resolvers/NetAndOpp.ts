import { Arg, Mutation, Query, Resolver } from "type-graphql";

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
  async getPost(@Arg("postId") postId: string) {
    const post = await NetwokingAndOpporunity.findOne(postId);
    return post;
  }

  @Query(() => Comment)
  async getComment(@Arg("postId") postId: string) {
    const post = await NetwokingAndOpporunity.findOne(postId, {
      relations: ["comments"],
    });
    return post?.comments;
  }

  @Mutation(() => Boolean)
  async createPost(
    @Arg("title") title: string,
    @Arg("content") content: string
    // image also
    // user from context
  ) {
    const post = NetwokingAndOpporunity.create({ title, content });
    post.save();
    return !!post;
  }

  @Mutation(() => Boolean)
  async editPost(@Arg("postId") postId: string) {
    // const update = NetwokingAndOpporunity.update();
    // take help from debos code
  }
}

export default NetwokingAndOpporunityResolver;
