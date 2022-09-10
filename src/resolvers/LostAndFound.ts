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
import { Category, EditDelPermission } from "../utils/index";
import User from "../entities/User";
import MyContext from "../utils/context";
import getItemsOutput from "../types/objects/items";
import fcm from "../utils/fcmTokens";
import { miliSecPerMonth } from "../utils/config.json";
import { FilteringConditions } from "../types/inputs/netop";
import { In } from "typeorm";

@Resolver((_type) => Item)
class LostAndFoundResolver {
  @Mutation((_type) => Item, {
    description:
      "Mutation to create the Item, anyone who is authorised and have either Lost an Item or have Found it can access",
  })
  @Authorized()
  async createItem(
    @Ctx() { user }: MyContext,
    @Arg("ItemInput") itemInput: ItemInput
  ) {
    try {
      //creating the item
      const item = new Item();
      item.name = itemInput.name;
      item.time = new Date(itemInput.time);
      item.location = itemInput.location;

      //stroring image from "image" to itemInput.image and added it to item.image
      if (itemInput.imageUrls) {
        let imageUrls = itemInput.imageUrls.join(" AND ");
        item.images = imageUrls === "" ? null : imageUrls;
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
    @Arg("Filters", { nullable: true })
    filteringConditions?: FilteringConditions
  ) {
    try {
      let itemsList = await Item.find({
        where: { category: In(categories), isResolved: false },
        order: { createdAt: "DESC" },
      });

      itemsList = itemsList.filter(
        (item) =>
          new Date(Date.now()).getTime() - new Date(item.createdAt).getTime() <
          miliSecPerMonth
      );

      if (filteringConditions) {
        if (filteringConditions.search) {
          itemsList = itemsList.filter((item) =>
            JSON.stringify(item)
              .toLowerCase()
              .includes(filteringConditions.search?.toLowerCase()!)
          );
        }
      }

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

  @Mutation(() => Item, {
    description:
      "Mutation : Mutation to edit the item, accessible to user who created that item",
  })
  @Authorized()
  async editItems(
    @Arg("ItemId") id: string,
    @Ctx() { user }: MyContext,
    @Arg("EditItemInput") editItemInput: EditItemInput
  ) {
    try {
      let item = await Item.findOne(id);

      if (item) {
        //stroring the image
        let imageUrlStr = [...(editItemInput.imageUrls ?? [])].join(" AND ");
        item.images = imageUrlStr === "" ? null : imageUrlStr;

        //storing the contact information
        if (!editItemInput.contact) {
          editItemInput.contact = user.mobile;
        }

        //updating the item
        item.contact = editItemInput.contact;
        if (editItemInput.name) item.name = editItemInput.name;
        if (editItemInput.location) item.location = editItemInput.location;
        if (editItemInput.time) item.time = new Date(editItemInput.time);

        const itemUpdated = await item.save();
        return itemUpdated;
      }
      throw new Error("Invalid Item");
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
        permissionList.push(
          EditDelPermission.EDIT,
          EditDelPermission.RESOLVE_ITEM
        );
      return permissionList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default LostAndFoundResolver;
