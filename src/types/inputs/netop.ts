import { GraphQLUpload } from "graphql-upload";
import { Field, InputType } from "type-graphql";
import { Upload } from "./Uploads";

@InputType({ description: "user" })
class createNetopsInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => [String])
  tags: string[];
}

@InputType()
class editNetopsInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  photo: string;
}

@InputType()
class fileringConditions {
  @Field(() => [String], { nullable: true })
  tags: string[];

  @Field(() => Boolean, { nullable: true })
  isStared: boolean;
}

@InputType()
class UploadImageInput {
  @Field(() => GraphQLUpload)
  image: Upload;
}

export {
  createNetopsInput,
  editNetopsInput,
  fileringConditions,
  UploadImageInput,
};
