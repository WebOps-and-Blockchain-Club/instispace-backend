import { Field, InputType } from "type-graphql";

@InputType()
class LoginInput {
  @Field()
  roll: string;

  @Field()
  pass: string;
}

export { LoginInput };
