import { UserRole } from "../../utils";
import { Field, ObjectType, registerEnumType } from "type-graphql";
registerEnumType(UserRole, { name: "UserRole" });

@ObjectType()
class LoginOutput {
  @Field(() => Boolean)
  isNewUser: boolean;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String)
  token: string;
}

export { LoginOutput };
