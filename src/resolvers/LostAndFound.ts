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
import { Category, miliSecPerMonth } from "../utils/index";
import User from "../entities/User";
import MyContext from "src/utils/context";
import { In } from "typeorm";
import { GraphQLUpload, Upload } from "graphql-upload";
import addAttachments from "../utils/uploads"

@Resolver((_type) => Item)
class LostAndFoundResolver {
  @Mutation((_type) => Boolean)
  @Authorized()
  async createItem(
    @Ctx() { user }: MyContext,
    @Arg("ItemInput") itemInput: ItemInput,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload
  ) {
    try {
      //stroring image from "image" to itemInput.image 
      if (image)
        itemInput.image = (await addAttachments([image], true)).join(
          " AND "
        );

      //creating the item 
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
        where: { category: In(categories), isResolved: false },
        order: { createdAt: "DESC" },
      });
      const filteredItems = items.filter(
        (item) =>
          new Date(Date.now()).getTime() - new Date(item.createdAt).getTime() <
          miliSecPerMonth
      );
      return filteredItems;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async resolveItem(@Ctx() { user }: MyContext, @Arg("ItemId") id: string) {
    try {
      const item = await Item.findOne({ where: { id }, relations: ["user"] });
      if (item?.user.id !== user.id) throw new Error("Invalid User");
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
    @Arg("EditItemInput") editItemInput: EditItemInput,
    @Arg("Image", () => GraphQLUpload, { nullable: true }) image?: Upload
  ) {
    try {
      //stroring the image 
      if (image)
        editItemInput.image = (await addAttachments([image], true)).join(
          " AND "
        );

      //updating the item
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
