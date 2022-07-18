import {
  Category,
  ComplaintCategory,
  UserRole,
  Notification,
  UserPermission,
  EditDelPermission,
  getDepartment,
} from "../../utils";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import Netop from "../../entities/Netop";
import Announcement from "../../entities/Announcement";
import User from "../../entities/User";
import Event from "../../entities/Event";
registerEnumType(UserRole, { name: "UserRole" });
registerEnumType(Category, { name: "Category" });
registerEnumType(ComplaintCategory, { name: "ComplaintCategory" });
registerEnumType(Notification, { name: "Notification" });
registerEnumType(UserPermission, { name: "UserPermission" });
registerEnumType(EditDelPermission, { name: "EditDelPermission" });

@ObjectType({ description: "Output for Login Mutation" })
class LoginOutput {
  @Field(() => Boolean, {
    description: "true if the user is logging in for the first time",
  })
  isNewUser: boolean;

  @Field(() => UserRole, { description: "User's role" })
  role: UserRole;

  @Field(() => String, { description: "jwt token, used for authorization" })
  token: string;
}

@ObjectType("homeOutput", { description: " Output type for getHome query" })
class homeOutput {
  @Field(() => [Netop], { nullable: true })
  netops: Netop[];

  @Field(() => [Announcement], { nullable: true })
  announcements: Announcement[];

  @Field(() => [Event], { nullable: true })
  events: Event[];
}

@ObjectType("searchUserOutput", {
  description: "Output type for serachUsers query",
})
class searchUsersOutput {
  @Field(() => [User], { nullable: true })
  usersList: User[];

  @Field(() => Number)
  total: number;

  //TODO: events
}

@ObjectType("getSuperUsersOutput", {
  description: "Output type for getSuperUsers query",
})
class getSuperUsersOutput {
  @Field(() => [User], { nullable: true })
  usersList: User[];

  @Field(() => Number)
  total: Number;
  //TODO: events
}

@ObjectType("getUsersOutput", {
  description: "Output type for getSuperUsers query",
})
class getUsersOutput {
  @Field(() => [User], { nullable: true })
  usersList: User[];

  @Field(() => Number)
  total: number;
}

@ObjectType("LDAPUser")
class LDAPUser {
  @Field()
  name: string;

  @Field()
  roll: string;

  @Field()
  department: string;

  constructor(name: string, roll: string) {
    this.name = name;
    this.roll = roll;
    this.department = getDepartment(roll?.slice(0, 2));
  }
}

@ObjectType("SearchLDAPUserOutput")
class SearchLDAPUserOutput {
  @Field(() => [LDAPUser], { nullable: true })
  list: LDAPUser[];

  @Field(() => Number)
  total: number;
}

export {
  LoginOutput,
  homeOutput,
  getUsersOutput,
  getSuperUsersOutput,
  searchUsersOutput,
  LDAPUser,
  SearchLDAPUserOutput,
};
