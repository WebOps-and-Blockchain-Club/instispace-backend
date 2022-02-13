import { Field, InputType } from "type-graphql";

@InputType()
class CreateAmenityInput {
  @Field({ description: "Amenity's name" })
  name: string;

  @Field({ description: "Amenity description" })
  description: string;
}

@InputType()
class EditAmenityInput {
  @Field({ nullable: true, description: "name" })
  name: string;

  @Field({ nullable: true, description: "description" })
  description: string;
}

export { CreateAmenityInput, EditAmenityInput };
