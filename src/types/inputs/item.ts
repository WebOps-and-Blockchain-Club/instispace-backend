import { Category } from "../../utils/index";
import { Field, InputType } from "type-graphql";

@InputType({ description: "Item  Input" })
class ItemInput {
  @Field({ description: "Item's Title" })
  name: string;

  @Field({ description: "Item's Descriptions" })
  description: string;

  @Field({description: "Item's visual description" , nullable: true })
  image?: string;

  @Field({description: "Item's Category can be either Lost or Found"})
  category: Category;
}

export default ItemInput;