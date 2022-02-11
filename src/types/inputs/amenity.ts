import { Field, InputType } from "type-graphql";

@InputType()
class CreateAmenityInput {
  @Field()
  name: string;

  @Field()
  description: string;
}

@InputType()
class EditAmenityInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;
}

export { CreateAmenityInput, EditAmenityInput };
