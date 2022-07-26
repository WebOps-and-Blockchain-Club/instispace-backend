import Amenity from "../entities/Amenity";
import { CreateAmenityInput, EditAmenityInput } from "../types/inputs/amenity";
import { EditDelPermission, UserRole } from "../utils/index";
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
  @Mutation(() => Amenity, {
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
        const createdAmenity = await amenity.save();
        return createdAmenity;
      }
      throw new Error("Unauthorized");
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Amenity], {
    description: "Query to get all amenities, Restrictions: {Admins}",
  })
  @Authorized()
  async getAmenities(@Arg("HostelId") hostelId?: string) {
    try {
      let amenities: Amenity[] = [];
      if (hostelId) {
        const hostel = await Hostel.findOne({
          where: { id: hostelId },
          relations: ["amenities"],
        });
        amenities = hostel!.amenities;
      } else {
        amenities = await Amenity.find();
      }
      return amenities;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Amenity, {
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
        return amenityUpdated;
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

  @FieldResolver(() => [EditDelPermission])
  async permissions(
    @Ctx() { user }: MyContext,
    @Root() { id, permissions }: Amenity
  ) {
    try {
      if (permissions) return permissions;
      const permissionList: EditDelPermission[] = [];
      const amenity = await Amenity.findOne(id, {
        relations: ["hostel"],
      });
      if (
        amenity &&
        ([UserRole.ADMIN, UserRole.HAS].includes(user.role) ||
          user.hostel === amenity.hostel)
      )
        permissionList.push(EditDelPermission.EDIT, EditDelPermission.DELETE);
      return permissionList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default AmenitiesResolver;
