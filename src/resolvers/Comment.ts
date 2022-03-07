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
    const comment = await Comment.findOneOrFail(id, {
      relations: ["createdBy"],
      order: { createdAt: "DESC" },
    });
    return comment.createdBy;
  }

  @FieldResolver(() => Netop)
  @Authorized()
  async netop(@Root() { id, netop }: Comment) {
    if (netop) return netop;
    const comment = await Comment.findOneOrFail(id, { relations: ["netop"] });
    return comment.netop;
  }

  @FieldResolver(() => MyQuery)
  @Authorized()
  async query(@Root() { id, query }: Comment) {
    if (query) return query;
    const comment = await Comment.findOneOrFail(id, { relations: ["query"] });
    return comment.query;
  }
}

export default CommentResolver;
