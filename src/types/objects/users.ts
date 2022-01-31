import { Category, ComplaintCategory, UserRole } from "../../utils";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import Netop from "../../entities/Netop";
import Announcement from "../../entities/Announcement";
registerEnumType(UserRole, { name: "UserRole" });
registerEnumType(Category, { name: "Category" });
registerEnumType(ComplaintCategory, { name: "ComplaintCategory" });

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

@ObjectType()
class homeOutput {
  @Field(() => [Netop])
  netops: Netop[];

  @Field(() => [Announcement])
  announcements: Announcement[];

  //TODO: events
}

export { LoginOutput, homeOutput };
