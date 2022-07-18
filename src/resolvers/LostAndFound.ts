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
import { Category, EditDelPermission, miliSecPerMonth } from "../utils/index";
import User from "../entities/User";
import MyContext from "../utils/context";
import { ILike, In } from "typeorm";
import { GraphQLUpload, Upload } from "graphql-upload";
import addAttachments from "../utils/uploads";
import getItemsOutput from "../types/objects/items";
import fcm from "../utils/fcmTokens";

@Resolver((_type) => Item)
class LostAndFoundResolver {
  @Mutation((_type) => Item, {
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

      if (item.category == Category.FOUND) {
        const iUsers = await User.find({ where: { notifyFound: true } });

        iUsers.map(async (u) => {
          u.fcmToken &&
            u.fcmToken.split(" AND ").map(() => {
              if (u.notifyFound) {
                const message = {
                  to: u.fcmToken,
                  notification: {
                    title: `Hi ${u?.name}`,
                    body: "We found something",
                  },
                };

                fcm.send(message, (err: any, response: any) => {
                  if (err) {
                    console.log("Something has gone wrong!" + err);
                    console.log("Respponse:! " + response);
                  } else {
                    // showToast("Successfully sent with response");
                    console.log("Successfully sent with response: ", response);
                  }
                });
              }
            });
        });
      }
      return item;
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
    @Arg("ItemsFilter", () => [Category]) categories: [Category],
    @Arg("LastItemId") lastItemId: string,
    @Arg("take") take: number,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      let itemsList: Item[] = [];
      if (search) {
        await Promise.all(
          ["name", "location"].map(async (field: string) => {
            const filter = {
              [field]: ILike(`%${search}%`),
              isResolved: false,
              category: In(categories),
            };
            const itemF = await Item.find({
              where: filter,
              order: { createdAt: "DESC" },
            });
            itemF.forEach((item) => {
              itemsList.push(item);
            });
          })
        );
        let uniqueItems: Item[] = [];
        itemsList.forEach((item) => {
          if (!uniqueItems.includes(item)) uniqueItems.push(item);
        });
        itemsList = uniqueItems;
      } else {
        itemsList = await Item.find({
          where: { category: In(categories), isResolved: false },
          order: { createdAt: "DESC" },
        });
      }
      itemsList = itemsList.filter(
        (item) =>
          new Date(Date.now()).getTime() - new Date(item.createdAt).getTime() <
          miliSecPerMonth
      );
      const total = itemsList.length;
      if (lastItemId) {
        const index = itemsList.map((n) => n.id).indexOf(lastItemId);
        itemsList = itemsList.splice(index + 1, take);
      } else {
        itemsList = itemsList.splice(0, take);
      }
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
        editItemInput.images = (await addAttachments([...images], true)).join(
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

  @FieldResolver(() => [EditDelPermission])
  async permissions(
    @Ctx() { user }: MyContext,
    @Root() { id, permissions }: Item
  ) {
    try {
      if (permissions) return permissions;
      const permissionList: EditDelPermission[] = [];
      const item = await Item.findOne(id, {
        relations: ["user"],
      });
      if (item && user.id === item.user.id)
        permissionList.push(EditDelPermission.EDIT, EditDelPermission.DELETE);
      return permissionList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default LostAndFoundResolver;
