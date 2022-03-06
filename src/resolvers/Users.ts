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
import { In, ILike } from "typeorm";
import Hostel from "../entities/Hostel";
import Item from "../entities/Item";
import NetopResolver from "./Netop";
import { fileringConditions } from "../types/inputs/netop";
import Announcement from "./Announcement";
import Event from "./Event";
import { Notification } from "../utils/index";
import Feedback from "../entities/Feedback";
import { mail } from "../utils/mail";
import fcm from "../utils/fcmTokens";

@Resolver((_type) => User)
class UsersResolver {
  @Mutation(() => LoginOutput, {
    description: "Mutation to login, Restrictions : {none}",
  })
  async login(
    @Arg("LoginInputs") { roll, pass }: LoginInput,
    @Arg("fcmToken") fcmToken: string
  ) {
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
          if (newUser.fcmToken) {
            newUser.fcmToken += " AND " + fcmToken;
          } else {
            newUser.fcmToken = fcmToken;
          }
          newUser.notifyEvent = Notification.FOLLOWED_TAGS;
          newUser.notifyNetop = Notification.FOLLOWED_TAGS;
          newUser.notifyFound = false;
          newUser.notifyMyQuery = true;
          newUser.notifyNetopComment = true;
          await newUser.save();
          const token = jwt.sign(newUser.id, process.env.JWT_SECRET!);
          return { isNewUser: newUser.isNewUser, role: UserRole.USER, token };
        }
        //If user exists
        else {
          console.log("I am here");
          if (user.fcmToken) {
            user.fcmToken += " AND " + fcmToken;
          } else {
            user.fcmToken = fcmToken;
          }
          user.notifyEvent = Notification.FOLLOWED_TAGS;
          user.notifyNetop = Notification.FOLLOWED_TAGS;
          user.notifyFound = false;
          user.notifyMyQuery = true;
          user.notifyNetopComment = true;
          await user.save();
          console.log(user.fcmToken);
          const token = jwt.sign(user.id, process.env.JWT_SECRET!);
          return {
            isNewUser: user.isNewUser,
            role: user.role,
            token,
            fcmToken: user.fcmToken,
          };
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
            if (admin.fcmToken) {
              admin.fcmToken += " AND " + fcmToken;
            } else {
              admin.fcmToken = fcmToken;
            }
            admin.password = await bcrypt.hash(adminPassword, salt);
            admin.notifyEvent = Notification.FOLLOWED_TAGS;
            admin.notifyNetop = Notification.FOLLOWED_TAGS;
            admin.notifyFound = false;
            admin.notifyMyQuery = true;
            admin.notifyNetopComment = true;
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
      "Mutation to create a Super-User account, Restrictions : {Admin}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.SECRETORY])
  async createAccount(
    @Ctx() { user }: MyContext,
    @Arg("CreateAccountInput") createAccountInput: CreateAccountInput,
    @Arg("HostelId", { nullable: true }) hostelId: string
  ) {
    try {
      //Autogenerating the password
      var password =
        process.env.NODE_ENV === "development"
          ? accountPassword
          : autoGenPass(8);

      if (
        [UserRole.SECRETORY, UserRole.HAS].includes(createAccountInput.role) &&
        user.role !== UserRole.ADMIN
      ) {
        throw new Error("Invalid Role");
      }
      //Creating the User
      const newUser = new User();
      newUser.role = createAccountInput.role;
      //finding the hostel if provided
      if (hostelId && [UserRole.ADMIN, UserRole.HAS].includes(user.role)) {
        const hostel = await Hostel.findOne({ where: { id: hostelId } });
        if (!hostel) throw new Error("Invalid Hostel");
        newUser.hostel = hostel;
      }
      newUser.roll = createAccountInput.roll;
      newUser.name = createAccountInput.name;
      newUser.notifyEvent = Notification.FOLLOWED_TAGS;
      newUser.notifyNetop = Notification.FOLLOWED_TAGS;
      newUser.notifyFound = false;
      newUser.notifyMyQuery = true;
      newUser.notifyNetopComment = true;
      newUser.isNewUser = true;
      newUser.password = bcrypt.hashSync(password, salt);
      await newUser.save();
      console.log(password);
      //this password is going to be emailed to the Super-User
      if (process.env.NODE_ENV !== "development")
        await mail({
          email: `${newUser.roll}`,
          subject: "Super-User login credentials",
          htmlContent: "",
        });
      return !!newUser;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async logout(@Ctx() { user }: MyContext, @Arg("fcmToken") fcmToken: string) {
    console.log("inside logout for", user.name, fcmToken);
    const u = await User.findOneOrFail(user.id);
    let fcmTokenArr = u.fcmToken.split(" AND ");
    const index = fcmTokenArr.indexOf(fcmToken);
    let newFcmToken = "";

    if (index > -1) {
      fcmTokenArr.splice(index, 1);
      let newFcmTokenArr = fcmTokenArr;
      console.log(newFcmTokenArr);
      newFcmToken =
        newFcmTokenArr.length > 1
          ? newFcmTokenArr.join(" AND ")
          : newFcmTokenArr.toString();
    }

    const affected = await User.update(user.id, { fcmToken: newFcmToken });

    return affected && 1;
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
      let superUsersList: User[] = [];
      if (search) {
        await Promise.all(
          ["name", "roll"].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`) };
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
        superUsersList = Array.from(uniqueItemStr).map((str) =>
          JSON.parse(str)
        );
      } else {
        superUsersList = await User.find({ where: { role: In(roles) } });
      }
      const total = superUsersList.length;
      if (lastUserId) {
        const index = superUsersList.map((n) => n.id).indexOf(lastUserId);
        superUsersList = superUsersList.splice(index + 1, take);
      } else {
        superUsersList = superUsersList.splice(0, take);
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
      let usersList: User[] = [];
      if (search) {
        await Promise.all(
          ["roll", "name"].map(async (field: string) => {
            const filter = { [field]: ILike(`%${search}%`) };
            const userF = await User.find({ where: filter });
            userF.forEach((user) => {
              usersList.push(user);
            });
          })
        );

        const userStr = usersList.map((obj) => JSON.stringify(obj));
        const uniqueUserStr = new Set(userStr);
        usersList = Array.from(uniqueUserStr).map((str) => JSON.parse(str));
      } else {
        usersList = await User.find({
          where: { role: In([UserRole.USER, UserRole.MODERATOR]) },
        });
      }
      const total = usersList.length;
      if (lastUserId) {
        const index = usersList.map((n) => n.id).indexOf(lastUserId);
        usersList = usersList.splice(index + 1, take);
      } else {
        usersList = usersList.splice(0, take);
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
    let usersList: User[] = [];
    await Promise.all(
      ["roll", "name"].map(async (field: string) => {
        const filter = { [field]: ILike(`%${search}%`) };
        const userF = await User.find({ where: filter });
        userF.forEach((user) => {
          usersList.push(user);
        });
      })
    );

    const userStr = usersList.map((obj) => JSON.stringify(obj));
    const uniqueUserStr = new Set(userStr);
    usersList = Array.from(uniqueUserStr).map((str) => JSON.parse(str));
    const total = usersList.length;
    if (lastUserId) {
      const index = usersList.map((n) => n.id).indexOf(lastUserId);
      usersList = usersList.splice(index + 1, take);
    } else {
      usersList = usersList.splice(0, take);
    }
    return { usersList: usersList, total };
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to change Super-Users passwords, Restrictions : {Leads, Hostel Affair Secretory and Hostel Secretory}",
  })
  @Authorized([
    UserRole.LEADS,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
    UserRole.SECRETORY,
  ])
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
  @Authorized([
    UserRole.ADMIN,
    UserRole.LEADS,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
    UserRole.SECRETORY,
  ])
  async updateRole(@Arg("ModeratorInput") { roll }: ModeratorInput) {
    try {
      const user = await User.findOne({ where: { roll } });
      if (!user) throw new Error("User doesn't exist");
      if (user.role !== UserRole.USER) throw new Error("Invalid Role");
      user.role = UserRole.MODERATOR;
      await user.save();

      console.log(user.fcmToken.split(" AND "), user.fcmToken);

      if (!!user) {
        user.fcmToken.split(" AND ").map(() => {
          console.log("inside notifications");
          const message = {
            to: "f_ai5jptQpm8kpw0DgPguo:APA91bFimvIpTaloCUUx-aGz0iHH-U7d-uwh7JJ-VqMTXmouKMZaXcw6nte9uARynQwTqQ_uAJ6Xd7v-RL1ZTvbLS4a3ytm9BXVfZUrB8Q-EBbCl6jpxvrAmeYXtkbxuzqKZ8pMKgUiB",
            notification: {
              title: `Hi ${user.name}`,
              body: `Your role changed to ${user.role}`,
            },
          };

          fcm.send(message, (err: any, response: any) => {
            if (err) {
              console.log("Something has gone wrong!" + err);
              console.log("Respponse:! " + response);
            } else {
              // showToast("Successfully sent with response");
              console.log("Successfully sent with response: ", response);
            }
          });
        });
      }
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

  @Mutation(() => Boolean)
  @Authorized()
  async changeNotificationSettings(
    @Ctx() { user }: MyContext,
    @Arg("toggleNotifyFound", () => Boolean)
    toggleNotifyFound: boolean,
    @Arg("toggleNotifyMyQuery", () => Boolean)
    toggleNotifyMyQuery: boolean,
    @Arg("notifyNetop", () => Notification, { nullable: true })
    notifyNetop?: Notification,
    @Arg("notifyEvent", () => Notification, { nullable: true })
    notifyEvent?: Notification
  ) {
    const u = await User.findOneOrFail(user.id);
    u.notifyMyQuery = toggleNotifyMyQuery;
    u.notifyFound = toggleNotifyFound;
    if (notifyEvent) {
      if (notifyEvent == Notification.FORALL) {
        u.notifyEvent = Notification.FORALL;
      } else if (notifyEvent == Notification.FOLLOWED_TAGS) {
        u.notifyEvent = Notification.FOLLOWED_TAGS;
      } else if (notifyEvent == Notification.NONE) {
        u.notifyEvent = Notification.NONE;
      }
    }
    if (notifyNetop) {
      if (notifyNetop == Notification.FORALL) {
        u.notifyNetop = Notification.FORALL;
      } else if (notifyNetop == Notification.FOLLOWED_TAGS) {
        u.notifyNetop = Notification.FOLLOWED_TAGS;
      } else if (notifyNetop == Notification.NONE) {
        u.notifyNetop = Notification.NONE;
      }
    }
    await u.save();
    return !!u;
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
    try {
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
        const events = (await eventObject.getEvents(myCon, "", 25, filters))
          .list;
        const announcements = (
          await announcementObject.getAnnouncements("", 25, user!.hostel!.id)
        ).announcementsList;
        return { netops, announcements, events };
      }
    } catch (e) {
      throw new Error(`message: ${e}`);
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

  @FieldResolver(() => [Feedback], { nullable: true })
  async feedbacks(@Root() { id, feedbacks }: User) {
    try {
      if (feedbacks) return feedbacks;
      const user = await User.findOne({
        where: { id: id },
        relations: ["feedbacks"],
      });
      return user?.feedbacks;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
}

export default UsersResolver;
