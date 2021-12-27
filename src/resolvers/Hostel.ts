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
import {
  accountPassword,
  emailExpresion,
  salt,
  UserRole,
} from "../utils/index";
import bcrypt from "bcryptjs";
import { CreateSecInput, CreateHostelInput } from "../types/inputs/hostel";
import Announcement from "../entities/Announcement";

@Resolver((_type) => Hostel)
class HostelResolver {
  @Mutation(() => Boolean, {
    description:
      "Mutation to create Hostel secretory, Restrictions : {Admin, Hostel Affair Secretory}",
  })
  @Authorized(["HAS", "ADMIN"])
  async createSec(@Arg("CreateSecInput") createSecInput: CreateSecInput) {
    try {
      if (emailExpresion.test(createSecInput.roll) === false)
        throw new Error("Invalid Email");
      const user = new User();
      user.role = UserRole.HOSTEL_SEC;
      user.roll = createSecInput.roll;
      user.isNewUser = true;
      function autoGenPass(length: number) {
        var result = "";
        var characters =
          "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }
        return result;
      }
      var password =
        process.env.NODE_ENV === "development"
          ? accountPassword
          : autoGenPass(8);
      user.password = bcrypt.hashSync(password, salt);
      await user.save();
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
  @Authorized(["ADMIN", "HAS", "HOSTEL_SEC"])
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

  @FieldResolver(() => [Announcement], { nullable: true })
  async announcements(@Root() { id }: Hostel) {
    try {
      const hostel = await Hostel.findOne({
        where: { id },
        relations: ["announcements"],
      });
      return hostel?.announcements;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default HostelResolver;
