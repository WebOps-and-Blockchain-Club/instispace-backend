import ItemInput from "../types/inputs/item";
import { Arg, Authorized, Mutation, Query, Resolver } from "type-graphql";
import Item from "../entities/Item";
import { UserRole } from "../utils";

@Resolver()
class LostAndFoundResolver {
  @Mutation((_type) => Boolean)
  @Authorized([UserRole.USER])
  async createItem(
    @Arg("ItemInput") itemInput: ItemInput,
  ) {
    try {
      const item = new Item();
      item.name = itemInput.name;
      item.description = itemInput.description;
      item.image = itemInput.image;
      item.category = itemInput.category;
      await item.save();
      return !!item;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Item])
  @Authorized()
  async getItems() {
    return await Item.find();
  }

  // @Mutation()
  // @Authorized()
  // async editItems() {}
}

export default LostAndFoundResolver;