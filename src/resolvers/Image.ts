import { GraphQLUpload, Upload } from "graphql-upload";
import { getImageOutput } from "../types/objects/image";
import { Arg, Mutation, Resolver } from "type-graphql";
import addAttachments from "../utils/uploads";

@Resolver()
class ImageResolver {
  @Mutation(() => getImageOutput)
  // Type Stuff, auth temporarily deprocated
  // @Authorised()
  async imageUpload(
    @Arg("Image", () => [GraphQLUpload], { nullable: true }) imageData: Upload[]
  ) {
    try {
      if (imageData) {
        const imageUrls = await addAttachments([...imageData], true);
        return { imageUrls: imageUrls };
      }
      return { imageUrls: null };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default ImageResolver;
