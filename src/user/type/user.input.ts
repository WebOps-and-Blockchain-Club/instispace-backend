import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from './role.enum';

@InputType()
export class CreateUserInput {
  @Field()
  roll: string;

  @Field(() => UserRole)
  role: UserRole;
}

@InputType()
export class LoginInput {
  @Field()
  roll: string;

  @Field()
  pass: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  roll: string;

  @Field({ nullable: true })
  password: string;

  @Field({ nullable: true })
  newpass: string;
}
