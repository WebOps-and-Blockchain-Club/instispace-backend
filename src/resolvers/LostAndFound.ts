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
import addAttachments from "../utils/uploads";
import getItemsOutput from "../types/objects/items";

@Resolver((_type) => Item)
class LostAndFoundResolver {
  @Mutation((_type) => Boolean, {
    description:
      "Mutation to create the Item, anyone who is authorised and have either Lost an Item or have Found it can access",
  })
  @Authorized()
  async createItem(
    @Ctx() { user }: MyContext,
    @Arg("ItemInput") itemInput: ItemInput,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      //creating the item
      const item = new Item();
      item.name = itemInput.name;
      item.time = new Date(itemInput.time);
      item.location = itemInput.location;

      //stroring image from "image" to itemInput.image and added it to item.image
      if (images) {
        itemInput.images = (await addAttachments(images, true)).join(" AND ");
        item.images = itemInput.images;
      }

      //storing the contact information
      if (!itemInput.contact) {
        itemInput.contact = user.mobile;
      }

      item.contact = itemInput.contact;
      item.category = itemInput.category;
      item.user = user;

      await item.save();
      return !!item;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => getItemsOutput, {
    description:
      "Query to fetch all the unresolved items, filter by time of creation, Restrictions : {anyone who is authorised}",
  })
  @Authorized()
  async getItems(
    @Arg("take") take: number,
    @Arg("skip") skip: number,
    @Arg("ItemsFilter", () => [Category]) categories: [Category]
  ) {
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
      const total = filteredItems.length;
      const itemsList = filteredItems.splice(skip, take);
      return { itemsList: itemsList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to resolve the item, User who finds his lost entity will update, Restriction : {anyone who is authorised}",
  })
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

  @Mutation(() => Boolean, {
    description:
      "Mutation : Mutation to edit the item, accessible to user who created that item",
  })
  @Authorized()
  async editItems(
    @Arg("ItemId") id: string,
    @Ctx() { user }: MyContext,
    @Arg("EditItemInput") editItemInput: EditItemInput,
    @Arg("Images", () => [GraphQLUpload], { nullable: true }) images?: Upload[]
  ) {
    try {
      //stroring the image
      if (images)
        editItemInput.images = (await addAttachments([images], true)).join(
          " AND "
        );

      //storing the contact information
      if (!editItemInput.contact) {
        editItemInput.contact = user.mobile;
      }

      editItemInput.contact = editItemInput.contact;

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
