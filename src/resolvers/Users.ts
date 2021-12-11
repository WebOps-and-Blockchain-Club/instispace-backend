import {
  ModeratorInput,
  LeadInput,
  UserInput,
  CreateLeadInput,
  LoginInput,
  GetUserInput,
} from "../types/inputs/users";
import {
  adminEmail,
  adminPassword,
  emailExpresion,
  salt,
  UserRole,
  usersDevList,
} from "../utils";
import {
  Arg,
  Mutation,
  Query,
  Resolver,
  Ctx,
  Authorized,
  FieldResolver,
  Root,
} from "type-graphql";
import jwt from "jsonwebtoken";
import UsersDev from "../entities/UsersDev";
import User from "../entities/User";
import Tag from "../entities/Tag";
import { LoginOutput } from "../types/objects/users";
import MyContext from "src/utils/context";
import bcrypt from "bcryptjs";
import { In } from "typeorm";

@Resolver((_type) => User)
class UsersResolver {
  @Mutation(() => LoginOutput)
  async login(@Arg("LoginInputs") { roll, pass }: LoginInput) {
    /************ Checking the user credentials ************/
    //For users
    try {
      if (emailExpresion.test(roll) === false) {
        if (process.env.NODE_ENV === "development") {
          //If user development database is empty add few random users in database
          const usersDevCount = await UsersDev.count();
          if (usersDevCount === 0) {
            await Promise.all(
              usersDevList.map(async (_user) => {
                await UsersDev.create({ ..._user }).save();
              })
            );
          }

          //Check the user credentials in development database
          const ldapUser = await UsersDev.findOne({ where: { roll, pass } });
          if (!ldapUser) throw new Error("Invalid Credentials");
        } else {
          //Check with LDAP
          //TODO: Add function to check the credentials with LDAP
        }

        /************ Check the user details ************/
        const user = await User.findOne({ roll });
        //If user doesn't exists
        if (!user) {
          const newUser = new User();
          newUser.roll = roll;
          newUser.role = UserRole.USER;
          newUser.isNewUser = true;
          await newUser.save();
          const token = jwt.sign(newUser.id, process.env.JWT_SECRET!);
          return { isNewUser: newUser.isNewUser, role: UserRole.USER, token };
        }
        //If user exists
        else {
          const token = jwt.sign(user.id, process.env.JWT_SECRET!);
          return { isNewUser: user.isNewUser, role: user.role, token };
        }
      }
      //For admins and leads
      else {
        if (process.env.NODE_ENV === "development") {
          const admins = await User.find({ where: { roll } });
          if (admins.length === 0) {
            const admin = new User();
            admin.roll = adminEmail;
            admin.role = UserRole.ADMIN;
            admin.isNewUser = false;
            admin.password = await bcrypt.hash(adminPassword, salt);
            await admin.save();
          }
        }
        const user = await User.findOne({ where: { roll } });
        if (!user) throw new Error("Email Not Registered!");
        else {
          var passwordIsValid = await bcrypt.compare(pass, user.password);
          if (passwordIsValid === true) {
            const token = jwt.sign(user.id, process.env.JWT_SECRET!);
            return { isNewUser: user.isNewUser, role: user.role, token };
          } else {
            throw new Error("Invalid Credentials");
          }
        }
      }
    } catch (e) {
      throw new Error(`messsage : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized(["ADMIN"])
  async createLead(@Arg("CreateLeadInput") createLeadInput: CreateLeadInput) {
    try {
      if (emailExpresion.test(createLeadInput.roll) === false)
        throw new Error("Invalid Email");
      const user = new User();
      user.roll = createLeadInput.roll;
      user.isNewUser = true;
      user.role = UserRole.LEADS;
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
      var password = autoGenPass(8);
      user.password = bcrypt.hashSync(password, salt);
      await user.save();
      console.log(password);
      //this password is going to be emailed to lead
      return !!user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [User])
  @Authorized(["ADMIN", "LEADS", "MODERATOR"])
  async getAdminLeadAndMods(
    @Arg("RolesFilter", () => [UserRole]) roles: [UserRole]
  ) {
    try {
      return await User.find({ where: { role: In(roles) } });
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => [User])
  @Authorized()
  async getUsers() {
    try {
      return await User.find();
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => User)
  @Authorized()
  async getMe(@Ctx() { user }: MyContext) {
    return user;
  }

  @Query(() => User)
  @Authorized()
  async getUser(@Arg("GetUserInput") { id }: GetUserInput) {
    try {
      const user = await User.findOne({
        where: { id },
      });
      return user;
    } catch (e) {
      throw new Error(`messsage : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized(["LEADS"])
  async updateLead(
    @Ctx() { user }: MyContext,
    @Arg("LeadInput") leadInput: LeadInput
  ) {
    try {
      if (user.isNewUser === false) throw new Error("Already Signed");
      user.isNewUser = false;
      user.password = bcrypt.hashSync(leadInput.newPassword, salt);
      await user.save();
      return !!user;
    } catch (e) {
      throw new Error(`message: ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized(["ADMIN", "LEADS"])
  async updateRole(@Arg("ModeratorInput") { roll }: ModeratorInput) {
    try {
      const user = await User.findOne({ where: { roll } });
      if (!user) throw new Error("User doesn't exist");
      if (user.role !== UserRole.USER) throw new Error("Invalid Role");
      user.role = UserRole.MODERATOR;
      await user.save();
      return !!user;
    } catch (e) {
      throw new Error(`message: ${e}`);
    }
  }

  @Mutation(() => User)
  @Authorized(["USER"])
  async updateUser(
    @Ctx() { user }: MyContext,
    @Arg("UserInput") userInput: UserInput
  ) {
    try {
      user.name = userInput.name;
      user.hostel = userInput.hostel;
      if (user.isNewUser === true) user.isNewUser = false;
      let tags: Tag[] = [];
      for (let i = 0; i < userInput.interest.length; i++) {
        const tag = await Tag.findOne({
          where: { title: userInput.interest[i] },
          relations: ["users"],
        });
        if (!tag) throw new Error("No Such Tag");
        tag.users.push(user);
        await tag.save();
        tags.push(tag);
      }
      user.interest = tags;
      await user.save();
      return user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [Tag], { nullable: true })
  async interest(@Root() { id }: User) {
    try {
      const user = await User.findOne({
        where: { id },
        relations: ["interest"],
      });
      return user?.interest;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default UsersResolver;
