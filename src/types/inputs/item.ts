import { Category } from "../../utils/index";
import { Field, InputType } from "type-graphql";

@InputType({ description: "Item  Input" })
class ItemInput {
  @Field({ description: "Item's Title" })
  name: string;

  @Field({ description: "Item's Descriptions" })
  description: string;

  @Field({ description: "Item's visual description", nullable: true })
  images?: string;

  @Field({ description: "Item's Location" })
  location: string;

  @Field({ description: "Time at which the item is lost or found"})
  time: string;

  @Field({ description: "Item's Category can be either Lost or Found" })
  category: Category;
}

@InputType({ description: "Input for editing items" })
class EditItemInput {
  @Field({ description: "Item's Title", nullable: true })
  name?: string;

  @Field({ description: "Item's Descriptions", nullable: true })
  description?: string;

  @Field({ description: "Item's visual description", nullable: true })
  images?: string;
}
export { ItemInput, EditItemInput };
