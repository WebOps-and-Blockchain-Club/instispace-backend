import { UserRole } from "../../utils";
import { Field, InputType } from "type-graphql";
import { IsEmail, IsMobilePhone } from "class-validator";

@InputType({ description: "Input for Login Mutation" })
class LoginInput {
  @Field({ description: "User's Email/Roll-Number" })
  roll: string;

  @Field({ description: "User's Password" })
  pass: string;
}

@InputType({ description: "Input For Create Account Mutation" })
class CreateAccountInput {
  @Field({ description: "Super-User's email" })
  @IsEmail()
  roll: string;

  @Field({ description: "Super-User's role" })
  role: UserRole;
}

@InputType({ description: "Input for Update-User Mutation" })
class UserInput {
  @Field({ description: "LDAP User's name" })
  name: string;

  @Field({ description: "LDAP User's hostel" })
  hostel: string;

  @Field((_type) => [String], {
    description: "LDAP User's interests, collection of tags",
  })
  interest: string[];

  @IsMobilePhone("en-IN")
  @Field({ nullable: true, description: "LDAP User's Phone number" })
  mobile: string;
}

@InputType({ description: "Input for Change-Password Mutation" })
class UpdateSuperUserInput {
  @Field({ description: "New Password" })
  newPassword: string;

  @Field({ description: "New Password" })
  name: string;
}

@InputType({ description: "Input for updateRole Mutation" })
class ModeratorInput {
  @Field({ description: "Roll-Number of the user" })
  roll: string;
}

@InputType({ description: "Input for Query get User" })
class GetUserInput {
  @Field({ description: "User's Id" })
  id: string;
}

export {
  LoginInput,
  CreateAccountInput,
  UserInput,
  UpdateSuperUserInput,
  ModeratorInput,
  GetUserInput,
};
