import { Category } from "../../utils/index";
import { Field, InputType } from "type-graphql";

@InputType({ description: "Item  Input" })
class ItemInput {
  @Field({ description: "Item's Title" })
  name: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Images",
  })
  imageUrls?: string[];

  @Field({ nullable: true, description: "LDAP User's Phone number" })
  contact?: string;

  @Field({ description: "Item's Location" })
  location: string;

  @Field({ description: "Time at which the item is lost or found" })
  time: string;

  @Field({ description: "Item's Category can be either Lost or Found" })
  category: Category;
}

@InputType({ description: "Input for editing items" })
class EditItemInput {
  @Field({ description: "Item's Title", nullable: true })
  name?: string;

  @Field({ description: "Item's Location", nullable: true })
  location?: string;

  @Field({
    description: "Time at which the item is lost or found",
    nullable: true,
  })
  time?: string;

  @Field({ nullable: true, description: "LDAP User's Phone number" })
  contact?: string;

  @Field((_type) => [String], {
    nullable: true,
    description: "Announcement's Image URLs",
  })
  imageUrls: string[];
}
export { ItemInput, EditItemInput };
