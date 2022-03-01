import {
  Category,
  ComplaintCategory,
  UserRole,
  Notification,
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
  @Field(() => [Netop])
  netops: Netop[];

  @Field(() => [Announcement])
  announcements: Announcement[];

  @Field(() => [Event])
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

export {
  LoginOutput,
  homeOutput,
  getUsersOutput,
  getSuperUsersOutput,
  searchUsersOutput,
};
