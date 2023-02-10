import { Field, InputType } from '@nestjs/graphql';

@InputType()
class CreateAmenityInput {
  @Field({ description: "Amenity's name" })
  name: string;

  @Field({ description: 'Amenity description' })
  description: string;
}
export { CreateAmenityInput };
