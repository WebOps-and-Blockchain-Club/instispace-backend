import { UserRole } from "../../utils";
import { Field, InputType } from "type-graphql";

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
  roll: string;

  @Field({ description: "Super-User's role" })
  role: UserRole;
}

@InputType({description: "Input for Update-User Mutation"})
class UserInput {
  @Field({description: "User's name"})
  name: string;

  @Field({description : "User's hostel"})
  hostel: string;

  @Field((_type) => [String], {description : "User's interests, collection of tags"})
  interest: string[];
}

@InputType({description: "Input for Change-Password Mutation"})
class NewPass {
  @Field({description: "New Password"})
  newPassword: string;
}

@InputType({description: "Input for updateRole Mutation"})
class ModeratorInput {
  @Field({description: "Roll-Number of the user"})
  roll: string;
}

@InputType({description: "Input for Query get User"})
class GetUserInput {
  @Field({description : "User's Id"})
  id: string;
}

export {
  LoginInput,
  CreateAccountInput,
  UserInput,
  NewPass,
  ModeratorInput,
  GetUserInput,
};
