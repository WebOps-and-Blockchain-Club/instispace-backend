import { UserRole } from "../../utils";
import { Field, InputType } from "type-graphql";

@InputType()
class LoginInput {
  @Field()
  roll: string;

  @Field()
  pass: string;
}

@InputType()
class CreateAccountInput {
  @Field()
  roll: string;

  @Field()
  role: UserRole;
}

@InputType()
class UserInput {
  @Field()
  name: string;

  @Field()
  hostel: string;

  @Field((_type) => [String])
  interest: string[];
}

@InputType()
class NewPass {
  @Field()
  newPassword: string;
}

@InputType()
class ModeratorInput {
  @Field()
  roll: string;
}

@InputType()
class GetUserInput {
  @Field()
  id: string;
}

@InputType()
class CreateSecInput {
  @Field()
  roll: string;
}

@InputType()
class CreateHostelInput {
  @Field()
  name: string;
}

export {
  LoginInput,
  CreateAccountInput,
  UserInput,
  CreateSecInput,
  NewPass,
  ModeratorInput,
  CreateHostelInput,
  GetUserInput,
};
