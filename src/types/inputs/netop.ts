import { Field, InputType } from "type-graphql";

@InputType()
class CreateNetopsInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  photo: string;

  @Field(() => [String])
  tags: string[];
}

export default CreateNetopsInput;
