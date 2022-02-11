import Hostel from "../entities/Hostel";
import {
  Arg,
  Authorized,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import User from "../entities/User";
import { accountPassword, autoGenPass, salt, UserRole } from "../utils/index";
import bcrypt from "bcryptjs";
import { CreateSecInput, CreateHostelInput } from "../types/inputs/hostel";
import HostelContact from "../entities/Contact";
import Amenity from "../entities/Amenity";
import { CreateAmenityInput } from "../types/inputs/amenity";
import { CreateContactInput } from "../types/inputs/contact";

@Resolver((_type) => Hostel)
class HostelResolver {
  @Mutation(() => Boolean, {
    description:
      " Mutation to create Hostel secretory, Restrictions : {Admin, Hostel Affair Secretory} ",
  })
  @Authorized([UserRole.HAS, UserRole.ADMIN])
  async createSec(
    @Arg("CreateSecInput") createSecInput: CreateSecInput,
    @Arg("HostelId") id: string
  ) {
    try {
      // Finding the hostel
      const hostel = await Hostel.findOne({ where: { id: id } });

      // Autogenerating the password
      var password =
        process.env.NODE_ENV === "development"
          ? accountPassword
          : autoGenPass(8);

      // Creating the user
      const user = new User();
      user.role = UserRole.HOSTEL_SEC;
      user.roll = createSecInput.roll;
      user.hostel = hostel!;
      user.isNewUser = true;
      user.password = bcrypt.hashSync(password, salt);
      await user.save();

      // Sending the mail
      console.log(password);
      //this password is going to be emailed to Hostel_SEC
      return !!user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to create Hostels, Restrictions : {Admin, Hostel Secretory and Hostel Affair Secretory}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async createHostel(@Arg("CreateHostelInput") { name }: CreateHostelInput) {
    try {
      const hostel = new Hostel();
      hostel.name = name;
      await hostel.save();
      return !!hostel;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async createHostelContact(
    @Arg("CreateContactInput") contactInput: CreateContactInput,
    @Arg("HostelId") id: string
  ) {
    try {
      // finding the hostel
      const hostel = await Hostel.findOne({ where: { id } });
      if (!hostel) throw new Error("Invalid Hostel");

      //creating the contact
      const contact = new HostelContact();
      contact.type = contactInput.type;
      contact.name = contactInput.name;
      contact.contact = contactInput.contact;
      contact.hostel = hostel;
      await contact.save();
      return !!contact;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.HOSTEL_SEC])
  async createAmenity(
    @Arg("CreateAmenityInput") amenityInput: CreateAmenityInput,
    @Arg("HostelId") id: string
  ) {
    try {
      // finding the hostel
      const hostel = await Hostel.findOne({ where: { id } });
      if (!hostel) throw new Error("Invalid Hostel");

      //creating the amenity
      const amenity = new Amenity();
      amenity.name = amenityInput.name;
      amenity.description = amenityInput.description;
      amenity.hostel = hostel;
      await amenity.save();
      return !!amenity;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [Hostel], {
    description:
      "query to fetch hostels, Restrictions : {anyone who is authorized}",
  })
  @Authorized()
  async getHostels() {
    try {
      return await Hostel.find();
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [User], { nullable: true })
  async users(@Root() { id }: Hostel) {
    try {
      const hostel = await Hostel.findOne({ where: id, relations: ["users"] });
      return hostel?.users;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [HostelContact], { nullable: true })
  async contacts(@Root() { id, contacts }: Hostel) {
    try {
      if (contacts) return contacts;
      const hostel = await Hostel.findOne({ where: { id } });
      return hostel?.contacts;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [Amenity], { nullable: true })
  async amenities(@Root() { id, amenities }: Hostel) {
    try {
      if (amenities) return amenities;
      const hostel = await Hostel.findOne({ where: { id: id } });
      return hostel?.amenities;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default HostelResolver;
