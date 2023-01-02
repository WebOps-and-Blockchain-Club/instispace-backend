import { Field, ObjectType } from "type-graphql";

@ObjectType("getImageOutput", { description: "Output Type for image upload" })
class getImageOutput {
  @Field((_type) => [String], { nullable: true })
  imageUrls?: string[];
}

export { getImageOutput };
