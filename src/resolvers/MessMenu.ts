import { messMenu } from "../utils/index";
import { Authorized, Query, Resolver } from "type-graphql";

@Resolver()
class MessMenuResolver {
  @Query(() => String)
  @Authorized()
  async getMessMenu() {
    return messMenu;
  }
}

export default MessMenuResolver;
