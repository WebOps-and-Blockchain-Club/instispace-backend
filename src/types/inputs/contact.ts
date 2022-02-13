import { Field, InputType } from "type-graphql";

@InputType()
class CreateContactInput {
  @Field({ description: "Contact's type" })
  type: string;

  @Field({ description: "name of the Person" })
  name: string;

  @Field({ description: "Contact" })
  contact: string;
}

@InputType()
class EditContactInput {
  @Field({ nullable: true, description: "type of the Contact" })
  type: string;

  @Field({ nullable: true, description: "name of the person" })
  name: string;

  @Field({ nullable: true, description: "Contact" })
  contact: string;
}

export { CreateContactInput, EditContactInput };
