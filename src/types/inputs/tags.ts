import { Field, InputType } from "type-graphql";

@InputType({ description: "Input For create Tag Mutation" })
class TagInput {
  @Field({ description: "Tag's Title" })
  title: string;

  @Field({ description: "Tag's Category" })
  category: string;
}

export default TagInput;
