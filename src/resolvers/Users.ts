import {
  ModeratorInput,
  UserInput,
  CreateAccountInput,
  LoginInput,
  GetUserInput,
  UpdateSuperUserInput,
} from "../types/inputs/users";
import {
  autoGenPass,
  emailExpresion,
  getDepartment,
  getprogramme,
  PostStatus,
  salt,
  UserPermission,
  UserRole,
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
  LDAPUser,
  LoginOutput,
  searchUsersOutput,
} from "../types/objects/users";
import MyContext from "../utils/context";
import bcrypt from "bcryptjs";
import { In, ILike } from "typeorm";
import Hostel from "../entities/Hostel";
import Item from "../entities/Item";
import NetopResolver from "./Netop";
import { FilteringConditions } from "../types/inputs/netop";
import AnnouncementResolver from "./Announcement";
import EventResolver from "./Event";
import { Notification } from "../utils/index";
import Feedback from "../entities/Feedback";
import firebaseClient from "../services/firebase";
import MailService from "../services/mail";
import Announcement from "../entities/Announcement";
import ldapClient from "../utils/ldap";
import {
  adminEmail,
  adminPassword,
  accountPassword,
  usersDevList,
} from "../utils/config.json";
import { ValidationError } from "apollo-server";

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
        let ldapUser: any;
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
          ldapUser = await UsersDev.findOne({
            where: { roll: roll.toLowerCase(), pass },
          });
          if (!ldapUser) throw new Error("Invalid Credentials");
        } else {
          //Check with LDAP
          ldapUser = await ldapClient.auth(roll, pass);
          if (!ldapUser) throw new Error("Invalid Credentials");
        }

        /************ Check the user details ************/
        const user = await User.findOne({ roll: roll.toLowerCase() });
        //If user doesn't exists
        if (!user) {
          const newUser = new User();
          newUser.roll = roll.toLowerCase();
          newUser.role = UserRole.USER;
          newUser.ldapName = ldapUser.displayName;
          newUser.isNewUser = true;
          if (newUser.fcmToken && newUser.fcmToken.length) {
            newUser.fcmToken += " AND " + fcmToken;
          } else {
            newUser.fcmToken = fcmToken;
          }
          await newUser.save();
          const token = jwt.sign(newUser.id, process.env.JWT_SECRET!);
          return { isNewUser: newUser.isNewUser, role: UserRole.USER, token };
        }
        //If user exists
        else {
          if (user.fcmToken && user.fcmToken.length) {
            user.fcmToken += " AND " + fcmToken;
          } else {
            user.fcmToken = fcmToken;
          }
          await user.save();
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
          const admins = await User.find({ where: { role: UserRole.ADMIN } });

          if (admins.length === 0) {
            const admin = new User();
            admin.roll = adminEmail.toLowerCase();
            admin.role = UserRole.ADMIN;
            admin.isNewUser = false;
            if (admin.fcmToken && admin.fcmToken.length) {
              admin.fcmToken += " AND " + fcmToken;
            } else {
              admin.fcmToken = fcmToken;
            }
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
            if (user.fcmToken && user.fcmToken.length) {
              user.fcmToken += " AND " + fcmToken;
            } else {
              user.fcmToken = fcmToken;
            }
            user.save();
            return {
              isNewUser: user.isNewUser,
              role: user.role,
              token,
              fcmToken: user.fcmToken,
            };
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
  @Authorized()
  async updateFCMToken(
    @Ctx() { user }: MyContext,
    @Arg("fcmToken") fcmToken: string
  ) {
    try {
      let fcmTokens: string[] = user.fcmToken.split(" AND ");
      fcmTokens = fcmTokens.concat([fcmToken]);
      const uniqueFcmTokens = [...new Set(fcmTokens)];
      const { affected } = await User.update(user.id, {
        fcmToken: uniqueFcmTokens.join(" AND "),
      });
      return affected === 1;
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to create a Super-User account, Restrictions : {Admin}",
  })
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.SECRETARY])
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
        ([UserRole.SECRETARY, UserRole.HAS].includes(createAccountInput.role) &&
          user.role !== UserRole.ADMIN) ||
        (createAccountInput.role === UserRole.HOSTEL_SEC &&
          user.role === UserRole.SECRETARY)
      ) {
        throw new ValidationError("Invalid Role");
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

      // Validate input for [UserRole.HOSTEL_SEC]
      if (
        createAccountInput.role === UserRole.HOSTEL_SEC &&
        newUser.hostel === null
      )
        throw new ValidationError("Invalid Input");

      newUser.roll = createAccountInput.roll.toLowerCase();
      newUser.isNewUser = true;
      newUser.password = bcrypt.hashSync(password, salt);
      await newUser.save();

      // Sending Creadentials for Super User's
      if (process.env.NODE_ENV !== "development")
        MailService.sendAccountCreationMail(
          newUser.role,
          newUser.roll,
          password
        );

      return !!newUser;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @Mutation(() => Boolean)
  @Authorized()
  async logout(@Ctx() { user }: MyContext, @Arg("fcmToken") fcmToken: string) {
    const u = await User.findOneOrFail(user.id);
    let fcmTokenArr = u.fcmToken.split(" AND ");
    const index = fcmTokenArr.indexOf(fcmToken);
    let newFcmToken = "";

    if (index > -1) {
      fcmTokenArr.splice(index, 1);
      let newFcmTokenArr = fcmTokenArr;
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
    nullable: true,
    description:
      "Query to Fetch a User by id, Restroctions : {anyone who is authorised}",
  })
  @Authorized()
  async getUser(@Arg("GetUserInput") { id, roll }: GetUserInput) {
    try {
      if (!id && !roll) throw new Error("Invalid Input");

      let filter: { [k: string]: any } = {};
      if (id) filter.id = id;
      if (roll) filter.roll = roll;

      const user = await User.findOne({
        where: filter,
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

  @Query(() => [LDAPUser], { nullable: true })
  @Authorized()
  async searchLDAPUser(@Arg("search") search: string) {
    try {
      let users: any[] = (await ldapClient.search(search, 250)) as any[];
      const list = users
        .slice(0, 250)
        .map((user) => new LDAPUser(user.displayName, user.uid))
        .sort((a, b) => (a.roll > b.roll ? 1 : a.roll < b.roll ? -1 : 0));
      return list;
    } catch (e) {
      throw new Error(`message: ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to change Super-Users passwords, Restrictions : {Leads, Hostel Affair Secretory and Hostel Secretory}",
  })
  @Authorized([
    UserRole.LEADS,
    UserRole.HAS,
    UserRole.HOSTEL_SEC,
    UserRole.SECRETARY,
  ])
  async updateSuperUser(
    @Ctx() { user }: MyContext,
    @Arg("UpdateSuperUserInput") { newPassword, name }: UpdateSuperUserInput
  ) {
    try {
      user.name = name;
      user.isNewUser = false;
      user.password = bcrypt.hashSync(newPassword, salt);
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
  @Authorized([UserRole.ADMIN, UserRole.HAS, UserRole.SECRETARY])
  async updateRole(@Arg("ModeratorInput") { roll }: ModeratorInput) {
    try {
      const user = await User.findOne({ where: { roll } });
      if (!user) throw new Error("User doesn't exist");
      if (user.role !== UserRole.USER) throw new Error("Invalid Role");
      user.role = UserRole.MODERATOR;
      const updatedUser = await user.save();

      // Send Notification
      if (!!updatedUser) {
        firebaseClient.sendMessage(updatedUser.fcmToken.split(" AND "), {
          data: {
            click_action: "FLUTTER_NOTIFICATION_CLICK",
            title: "Role Updated",
            body: "Congratulations! You have been appointed as a Moderator.",
            route: "NONE",
          },
        });
      }
      return !!updatedUser;
    } catch (e) {
      throw new Error(`message: ${e}`);
    }
  }

  @Mutation(() => Boolean, {
    description:
      "Mutation to Update/Add User's name, interest, password, Restrictions : {User, Moderator}",
  })
  @Authorized([UserRole.MODERATOR, UserRole.USER])
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
        role == UserRole.SECRETARY
      ) {
        const user = await User.findOneOrFail(id, {
          relations: [
            "networkingAndOpportunities",
            "networkingAndOpportunities.reports",
            "event",
            "announcements",
          ],
        });

        let netops = user.networkingAndOpportunities;
        let announcements = user.announcements;
        let events = user.event;

        let d = new Date();

        netops = netops.filter(
          (netop) =>
            !netop.isHidden &&
            new Date(netop.endTime).getTime() > d.getTime() &&
            netop.reports.filter((nr) => nr.createdBy.id === user.id).length ===
              0 &&
            [
              PostStatus.POSTED,
              PostStatus.REPORTED,
              PostStatus.REPORT_REJECTED,
            ].includes(netop.status)
        );

        const d2 = d;
        d2.setHours(d.getHours() - 2); //Filter the events after the 2 hours time of completion
        events = events.filter(
          (event) =>
            !event.isHidden && new Date(event.time).getTime() > d.getTime()
        );

        announcements = announcements.filter(
          (announcement) =>
            !announcement.isHidden &&
            new Date(announcement.endTime).getTime() > d.getTime()
        );

        announcements
          .sort((a, b) =>
            a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
          )
          .splice(5);
        netops.sort((a, b) =>
          a.createdAt > b.createdAt ? -1 : a.createdAt < b.createdAt ? 1 : 0
        );
        events.sort((a, b) => (a.time > b.time ? -1 : a.time < b.time ? 1 : 0));

        return {
          announcements,
          netops,
          events,
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
        const announcementObject = new AnnouncementResolver();
        const eventObject = new EventResolver();

        let announcements;
        let netops;
        let events;
        if (tagIds && tagIds.length) {
          const filters: FilteringConditions = {
            tags: tagIds,
            isStared: false,
          };
          // take = -1 means return all
          netops = (await netopObject.getNetops(myCon, "", 15, filters))
            .netopList;
          events = (await eventObject.getEvents(myCon, "", 15, filters)).list;
        }

        if (user.hostel)
          announcements = (
            await announcementObject.getAnnouncements(
              "",
              5,
              myCon,
              user.hostel.id
            )
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

  @FieldResolver(() => [UserPermission])
  async permissions(@Root() { role, permissions }: User) {
    try {
      if (permissions && permissions.length) return permissions;

      let permissionList: UserPermission[] = [
        UserPermission.CREATE_FEEDBACK,
        UserPermission.CREATE_ITEM,
        UserPermission.CREATE_NETOP,
        UserPermission.CREATE_QUERY,
        UserPermission.GET_AMENITIES,
        UserPermission.GET_ANNOUNCEMENTS,
        UserPermission.GET_CONTACTS,
      ];
      if (role === UserRole.MODERATOR) {
        permissionList.push(UserPermission.GET_REPORTS);
      }
      if (role === UserRole.LEADS) {
        permissionList.push(
          UserPermission.CREATE_EVENT,
          UserPermission.CREATE_TAG
        );
      }
      if (role === UserRole.HOSTEL_SEC)
        permissionList.push(
          UserPermission.HOSTEL_ADMIN,
          UserPermission.CREATE_AMENITY,
          UserPermission.CREATE_ANNOUNCEMENT,
          UserPermission.CREATE_CONTACT,
          UserPermission.UPDATE_ROLE,
          UserPermission.CREATE_EVENT
        );
      if (role === UserRole.SECRETARY)
        permissionList.push(
          UserPermission.HOSTEL_ADMIN,
          UserPermission.CREATE_ACCOUNT,
          UserPermission.CREATE_ANNOUNCEMENT,
          UserPermission.CREATE_CONTACT,
          UserPermission.CREATE_TAG,
          UserPermission.GET_ALL_ANNOUNCEMENTS,
          UserPermission.GET_ALL_CONTACTS,
          UserPermission.GET_REPORTS,
          UserPermission.UPDATE_ROLE,
          UserPermission.CREATE_EVENT,
          UserPermission.VIEW_SUPER_USER_LIST
        );
      if (role === UserRole.HAS)
        permissionList.push(
          UserPermission.HOSTEL_ADMIN,
          UserPermission.CREATE_ACCOUNT,
          UserPermission.CREATE_AMENITY,
          UserPermission.CREATE_ANNOUNCEMENT,
          UserPermission.CREATE_CONTACT,
          UserPermission.CREATE_HOSTEL,
          UserPermission.CREATE_TAG,
          UserPermission.GET_ALL_AMENITIES,
          UserPermission.GET_ALL_ANNOUNCEMENTS,
          UserPermission.GET_ALL_CONTACTS,
          UserPermission.GET_REPORTS,
          UserPermission.UPDATE_ROLE,
          UserPermission.CREATE_EVENT,
          UserPermission.VIEW_SUPER_USER_LIST
        );
      if (role === UserRole.ADMIN)
        permissionList.push(
          UserPermission.HOSTEL_ADMIN,
          UserPermission.CREATE_ACCOUNT,
          UserPermission.CREATE_AMENITY,
          UserPermission.CREATE_ANNOUNCEMENT,
          UserPermission.CREATE_CONTACT,
          UserPermission.CREATE_HOSTEL,
          UserPermission.CREATE_TAG,
          UserPermission.GET_ALL_AMENITIES,
          UserPermission.GET_ALL_CONTACTS,
          UserPermission.GET_ALL_ANNOUNCEMENTS,
          UserPermission.GET_REPORTS,
          UserPermission.VIEW_FEEDBACK,
          UserPermission.UPDATE_ROLE,
          UserPermission.CREATE_EVENT,
          UserPermission.CREATE_REPORT_REASON,
          UserPermission.CREATE_NOTIFICATION,
          UserPermission.VIEW_SUPER_USER_LIST
        );
      return permissionList;
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver()
  async program(@Root() { id, program }: User) {
    try {
      if (program) return program;
      const user = await User.findOne({
        where: { id: id },
      });
      if (user?.role == UserRole.USER || user?.role == UserRole.MODERATOR)
        return getprogramme(user!.roll);
      return "Null";
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver()
  async department(@Root() { id, department }: User) {
    try {
      if (department) return department;
      const user = await User.findOne({
        where: { id: id },
      });
      if (user?.role == UserRole.USER || user?.role == UserRole.MODERATOR)
        return getDepartment(user!.roll.slice(0, 2));
      return "Null";
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }

  @FieldResolver(() => String)
  async photo(@Root() { roll, role }: User) {
    return role === UserRole.USER || role === UserRole.MODERATOR
      ? `https://instispace.iitm.ac.in/photos/byroll.php?roll=${roll.toUpperCase()}`
      : "";
  }
}

export default UsersResolver;
