import { Field, InputType } from "type-graphql";

@InputType()
class LoginInput {
  @Field()
  roll: string;

  @Field()
  pass: string;
}

@InputType()
class CreateLeadInput {
  @Field()
  roll: string;
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
class LeadInput {
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

export {
  LoginInput,
  CreateLeadInput,
  UserInput,
  LeadInput,
  ModeratorInput,
  GetUserInput,
};
