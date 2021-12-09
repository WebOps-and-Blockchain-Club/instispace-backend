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

@ObjectType()
class CreateLeadOutput {
  @Field(() => Boolean)
  isNewLead: boolean;

  @Field(() => UserRole)
  role: UserRole;

  @Field()
  autogenpass: string;
}

@ObjectType()
class GetUserOutput {
  @Field()
  name: string;

  @Field()
  hostel: string;

  @Field((_type) => [String])
  interest: [string];
}

export { LoginOutput, CreateLeadOutput, GetUserOutput };
