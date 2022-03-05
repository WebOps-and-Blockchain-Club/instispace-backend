import Amenity from "../entities/Amenity";
import { CreateAmenityInput, EditAmenityInput } from "../types/inputs/amenity";
import { UserRole } from "../utils/index";
import MyContext from "../utils/context";
import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import Hostel from "../entities/Hostel";

@Resolver(() => Amenity)
class AmenitiesResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to create Hostel-Amenity, Restrictions : {Admins, Hostel-Secretories(who belong the hostel), HAS}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async createAmenity(
    @Ctx() { user }: MyContext,
    @Arg("CreateAmenityInput") amenityInput: CreateAmenityInput,
    @Arg("HostelId") id: string
  ) {
    try {
      // finding the hostel
      const hostel = await Hostel.findOne({ where: { id } });
      if (!hostel) throw new Error("Invalid Hostel");

      if (
        user.hostel === hostel ||
        [UserRole.HAS, UserRole.ADMIN].includes(user.role)
      ) {
        //creating the amenity
        const amenity = new Amenity();
        amenity.name = amenityInput.name;
        amenity.description = amenityInput.description;
        amenity.hostel = hostel;
        await amenity.save();
        return !!amenity;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Amenity], {
    description: "Query to get all amenities, Restrictions: {Admins}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS])
  async getAmenities() {
    try {
      const amenities = await Amenity.find();
      return amenities;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to update Hostel-Amenity, Restrictions : {Admins, Hostel-Secretories(who belong the hostel), HAS}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async updateAmenity(
    @Arg("AmenityId") amenityId: string,
    @Ctx() { user }: MyContext,
    @Arg("UpdateAmenityInput") amenityInput: EditAmenityInput
  ) {
    try {
      const amenity = await Amenity.findOne({
        where: { id: amenityId },
      });
      if (!amenity) throw new Error("Invalid Amenity");

      if (
        user.hostel === amenity.hostel ||
        [UserRole.HAS, UserRole.ADMIN].includes(user.role)
      ) {
        if (amenityInput.name) amenity.name = amenityInput.name;
        if (amenityInput.description)
          amenity.description = amenityInput.description;
        const amenityUpdated = await amenity.save();
        return !!amenityUpdated;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to delete Hostel-Amenity, Restrictions : {Admin, Hostel-Secretory(related to hostel), HAS}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async deleteAmenity(
    @Arg("AmenityId") id: string,
    @Ctx() { user }: MyContext
  ) {
    try {
      const amenity = await Amenity.findOne({
        where: { id },
        relations: ["hostel"],
      });
      if (!amenity) throw new Error("Invalid Amenity");
      if (
        user.hostel === amenity?.hostel ||
        [UserRole.HAS, UserRole.ADMIN].includes(user.role)
      ) {
        const amenityDeleted = await amenity.remove();
        return !!amenityDeleted;
      }
      throw new Error("Unauthorised");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Hostel)
  async hostel(@Root() { id, hostel }: Amenity) {
    try {
      if (hostel) return hostel;
      const amenity = await Amenity.findOne({
        where: { id: id },
        relations: ["hostel"],
      });
      return amenity?.hostel;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default AmenitiesResolver;
