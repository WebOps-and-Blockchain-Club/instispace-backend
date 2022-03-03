import {
  ModeratorInput,
  UserInput,
  CreateAccountInput,
  LoginInput,
  GetUserInput,
  NewPass,
} from "../types/inputs/users";
import {
  accountPassword,
  adminEmail,
  adminPassword,
  autoGenPass,
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
import {
  getSuperUsersOutput,
  getUsersOutput,
  homeOutput,
  LoginOutput,
  searchUsersOutput,
} from "../types/objects/users";
import MyContext from "../utils/context";
import bcrypt from "bcryptjs";
import { In, Like } from "typeorm";
import Hostel from "../entities/Hostel";
import Item from "../entities/Item";
import NetopResolver from "./Netop";
import { fileringConditions } from "../types/inputs/netop";
import Announcement from "./Announcement";
import Event from "./Event";

@Resolver((_type) => User)
class UsersResolver {
  @Mutation(() => LoginOutput, {
    description: "Mutation to login, Restrictions : {none}",
  })
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

  @Mutation(() => Boolean, {
    description:
      "Mutation to create a Super-User account can't create Hostel_Sec, Restrictions : {Admin}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.SECRETORY])
  async createAccount(
    @Arg("CreateAccountInput") createAccountInput: CreateAccountInput
  ) {
    try {
      //Autogenerating the password
      var password =
        process.env.NODE_ENV === "development"
          ? accountPassword
          : autoGenPass(8);

      //Creating the User
      const user = new User();

      if (
        createAccountInput.role === UserRole.HOSTEL_SEC ||
        ([UserRole.HAS, UserRole.SECRETORY].includes(createAccountInput.role) &&
          user.role !== UserRole.ADMIN)
      )
        throw new Error("Invalid role");
      user.role = createAccountInput.role;
      user.roll = createAccountInput.roll;
      user.isNewUser = true;
      user.password = bcrypt.hashSync(password, salt);
      await user.save();
      console.log(password);
      //this password is going to be emailed to lead
      return !!user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => getSuperUsersOutput, {
    description:
      "Query to fetch Super-Users, Restrictions : {Admins, Leads, Moderators, Hostel Affair Secretory and Hostel Secretory}",
  })
  @Authorized([
    UserRole.ADMIN,
    UserRole.LEADS,
    UserRole.MODERATOR,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
  ])
  async getSuperUsers(
    @Arg("RolesFilter", () => [UserRole]) roles: [UserRole],
    @Arg("LastUserId") lastUserId: string,
    @Arg("take") take: number,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      let superUsers = await User.find({ where: { role: In(roles) } });
      const total = superUsers.length;
      var superUsersList: User[] = [];
      if (search) {
        await Promise.all(
          ["name", "roll"].map(async (field: string) => {
            const filter = { [field]: Like(`%${search}%`) };
            const userF = await User.find({
              where: filter,
            });
            userF.forEach((user) => {
              superUsersList.push(user);
            });
          })
        );
        const userStr = superUsersList.map((obj) => JSON.stringify(obj));
        const uniqueItemStr = new Set(userStr);
        superUsers = Array.from(uniqueItemStr).map((str) => JSON.parse(str));
      }
      if (lastUserId) {
        const index = superUsers.map((n) => n.id).indexOf(lastUserId);
        superUsersList = superUsers.splice(index + 1, take);
      } else {
        superUsersList = superUsers.splice(0, take);
      }
      return { usersList: superUsersList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => getUsersOutput, {
    description:
      "Query to fetch ldap Users, Restrictions : {anyone who is authorized}",
  })
  @Authorized()
  async getUsers(
    @Arg("LastUserId") lastUserId: string,
    @Arg("take") take: number,
    @Arg("search", { nullable: true }) search?: string
  ) {
    try {
      let users = await User.find({
        where: { role: In([UserRole.USER, UserRole.MODERATOR]) },
      });
      const total = users.length;
      var usersList: User[] = [];
      if (search) {
        await Promise.all(
          ["roll", "name"].map(async (field: string) => {
            const filter = { [field]: Like(`%${search}%`) };
            const userF = await User.find({ where: filter });
            userF.forEach((user) => {
              usersList.push(user);
            });
          })
        );

        const userStr = users.map((obj) => JSON.stringify(obj));
        const uniqueUserStr = new Set(userStr);
        users = Array.from(uniqueUserStr).map((str) => JSON.parse(str));
      }
      if (lastUserId) {
        const index = users.map((n) => n.id).indexOf(lastUserId);
        usersList = users.splice(index + 1, take);
      } else {
        usersList = users;
      }
      return { usersList: usersList, total };
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Query(() => User, {
    description:
      "Query to fetch personal profile, Restrictions : {anyone who is authoried}",
  })
  @Authorized()
  async getMe(@Ctx() { user }: MyContext) {
    return user;
  }

  @Query(() => User, {
    description:
      "Query to Fetch a User by id, Restroctions : {anyone who is authorised}",
  })
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

  @Query(() => searchUsersOutput, { nullable: true })
  @Authorized()
  async searchUser(
    @Arg("LastUserId") lastUserId: string,
    @Arg("take") take: number,
    @Arg("search", { nullable: true }) search?: string
  ) {
    let users: User[] = [];
    await Promise.all(
      ["roll", "name"].map(async (field: string) => {
        const filter = { [field]: Like(`%${search}%`) };
        const userF = await User.find({ where: filter });
        userF.forEach((user) => {
          users.push(user);
        });
      })
    );

    const userStr = users.map((obj) => JSON.stringify(obj));
    const uniqueUserStr = new Set(userStr);
    const finalList = Array.from(uniqueUserStr).map((str) => JSON.parse(str));
    const total = finalList.length;
    var usersList;
    if (lastUserId) {
      const index = finalList.map((n) => n.id).indexOf(lastUserId);
      usersList = finalList.splice(index + 1, take);
    } else {
      usersList = users.splice(0, take);
    }
    return { usersList: usersList, total };
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to change Super-Users passwords, Restrictions : {Leads, Hostel Affair Secretory and Hostel Secretory}",
  })
  @Authorized([UserRole.LEADS, UserRole.HAS, UserRole.HOSTEL_SEC])
  async updatePassword(
    @Ctx() { user }: MyContext,
    @Arg("NewPass") newPass: NewPass
  ) {
    try {
      if (user.isNewUser === false) throw new Error("Already Signed");
      user.isNewUser = false;
      user.password = bcrypt.hashSync(newPass.newPassword, salt);
      await user.save();
      return !!user;
    } catch (e) {
      throw new Error(`message: ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to change role of an ldap User to Moderator, Restrictions : {Admins and Leads}",
  })
  @Authorized([UserRole.ADMIN, UserRole.LEADS])
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

  @Mutation(() => Boolean, {
    description:
      "Mutation to Update/Add User's name, interest, password, Restrictions : {User}",
  })
  @Authorized([UserRole.USER])
  async updateUser(
    @Ctx() { user }: MyContext,
    @Arg("UserInput") userInput: UserInput
  ) {
    try {
      //finding the hostel by name
      const hostel = await Hostel.findOne({
        where: { name: userInput.hostel },
        relations: ["users"],
      });
      if (!hostel) throw new Error("Invalid Hostel");

      //updating user
      user.name = userInput.name;
      user.hostel = hostel;
      user.mobile = userInput.mobile;
      if (user.isNewUser === true) user.isNewUser = false;
      let tags: Tag[] = [];
      for (let i = 0; i < userInput.interest.length; i++) {
        const tag = await Tag.findOne({
          where: { id: userInput.interest[i] },
          relations: ["users"],
        });
        if (!tag) throw new Error("No Such Tag");
        tags.push(tag);
      }
      user.interest = tags;
      await user.save();
      return !!user;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [Tag], { nullable: true })
  async interest(@Root() { id, interest }: User) {
    try {
      if (interest) return interest;
      const user = await User.findOne({
        where: { id },
        relations: ["interest"],
      });
      return user?.interest;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => Hostel, { nullable: true })
  async hostel(@Root() { id, hostel }: User) {
    try {
      if (hostel) return hostel;
      const user = await User.findOne({ where: { id }, relations: ["hostel"] });
      return user?.hostel;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [Announcement], { nullable: true })
  async announcements(@Root() { id }: User) {
    try {
      const user = await User.findOne({
        where: { id },
        relations: ["announcements"],
      });
      return user?.announcements;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [Item], { nullable: true })
  async items(@Root() { id, items }: User) {
    try {
      if (items) return items;
      const user = await User.findOne({ where: { id }, relations: ["items"] });
      return user?.items;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => homeOutput, { nullable: true })
  async getHome(@Root() { id, role }: User) {
    if (
      role == UserRole.ADMIN ||
      role == UserRole.DEV_TEAM ||
      role == UserRole.HAS ||
      role == UserRole.HOSTEL_SEC ||
      role == UserRole.LEADS ||
      role == UserRole.SECRETORY
    ) {
      const user = await User.findOneOrFail(id, {
        relations: ["networkingAndOpportunities", "event", "announcements"],
      });

      return {
        netops: user.networkingAndOpportunities,
        announcements: user.announcements,
        events: user.event,
      };
    } else {
      const user = await User.findOneOrFail({
        where: { id },
        relations: ["interest", "hostel"],
      });

      const tagIds = user.interest?.map((tag) => tag.id);
      const myCon: MyContext = {
        user,
      };
      const netopObject = new NetopResolver();
      const announcementObject = new Announcement();
      const eventObject = new Event();
      const filters: fileringConditions = { tags: tagIds!, isStared: false };
      const netops = (await netopObject.getNetops(myCon, "", 25, filters))
        .netopList;
      const events = (await eventObject.getEvents(myCon, "", 25, filters)).list;
      const announcements = (
        await announcementObject.getAnnouncements("", 25, user!.hostel!.id)
      ).announcementsList;
      return { netops, announcements, events };
    }
  }

  @FieldResolver(() => [Item], { nullable: true })
  async complaints(@Root() { id, complaints }: User) {
    try {
      if (complaints) return complaints;
      const user = await User.findOne({
        where: { id },
        relations: ["complaints"],
      });
      return user?.complaints;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => [Item], { nullable: true })
  async complaintsUpvoted(@Root() { id, complaintsUpvoted }: User) {
    try {
      if (complaintsUpvoted) return complaintsUpvoted;
      const user = await User.findOne({
        where: { id },
        relations: ["complaintsUpvoted"],
      });
      return user?.complaintsUpvoted;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default UsersResolver;
