import { ItemInput, EditItemInput } from "../types/inputs/item";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import Item from "../entities/Item";
import { Category } from "../utils";
import User from "../entities/User";
import MyContext from "src/utils/context";
import { In } from "typeorm";

@Resolver((_type) => Item)
class LostAndFoundResolver {
  @Mutation((_type) => Boolean)
  @Authorized()
  async createItem(
    @Ctx() { user }: MyContext,
    @Arg("ItemInput") itemInput: ItemInput
  ) {
    try {
      const item = new Item();
      item.name = itemInput.name;
      item.description = itemInput.description;
      item.image = itemInput.image;
      item.category = itemInput.category;
      item.user = user;
      await item.save();
      return !!item;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Item])
  @Authorized()
  async getItems(@Arg("ItemsFilter", () => [Category]) categories: [Category]) {
    try {
      let items = await Item.find({
        where: { category: In(categories) },
        order: { createdAt: "DESC" },
      });
      let filteredItems = items?.filter((n) => n.isResolved === false);
      return filteredItems;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async resolveItems(@Ctx() { user }: MyContext, @Arg("ItemId") id: string) {
    try {
      const item = await Item.findOne({ where: { id }, relations: ["user"] });
      if(item?.user.id !== user.id) throw new Error("Invalid User");
      const { affected } = await Item.update(id, { isResolved: true });
      return affected === 1;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async editItems(
    @Arg("ItemId") id: string,
    @Arg("EditItemInput") editItemInput: EditItemInput
  ) {
    try {
      const { affected } = await Item.update(id, {
        ...editItemInput,
      });
      return affected === 1;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => User, { nullable: true })
  async user(@Root() { id }: Item) {
    try {
      const item = await Item.findOne({
        where: { id: id },
        relations: ["user"],
      });
      return item?.user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default LostAndFoundResolver;
