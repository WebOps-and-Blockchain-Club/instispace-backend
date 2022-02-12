import { Field, InputType } from "type-graphql";

@InputType()
class CreateContactInput {
  @Field()
  type: string;

  @Field()
  name: string;

  @Field()
  contact: string;
}

@InputType()
class EditContactInput {
  @Field({ nullable: true })
  type: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  contact: string;
}

export { CreateContactInput, EditContactInput };
