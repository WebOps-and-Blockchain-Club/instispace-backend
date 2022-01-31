import User from "../entities/User";
import { Authorized, FieldResolver, Resolver, Root } from "type-graphql";
import Comment from "../entities/Common/Comment";
import Netop from "../entities/Netop";
import MyQuery from "../entities/MyQuery";

@Resolver(Comment)
class CommentResolver {
  @FieldResolver(() => User)
  @Authorized()
  async createdBy(@Root() { id }: Comment) {
    const comment = await Comment.findOne(id, { relations: ["createdBy"] });
    return comment?.createdBy;
  }

  @FieldResolver(() => Netop)
  @Authorized()
  async netop(@Root() { id }: Comment) {
    const comment = await Comment.findOne(id, { relations: ["netop"] });
    return comment?.netop;
  }

  @FieldResolver(() => MyQuery)
  @Authorized()
  async query(@Root() { id }: Comment) {
    const comment = await Comment.findOne(id, { relations: ["query"] });
    return comment?.query;
  }
}

export default CommentResolver;
