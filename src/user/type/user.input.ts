import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from './role.enum';

@InputType()
export class CreateUserInput {
  @Field()
  name: string;

  @Field()
  roll: string;

  @Field(() => UserRole)
  role: UserRole;

  @Field(() => String)
  pass: string;
}

@InputType()
export class LoginInput {
  @Field()
  roll: string;

  @Field()
  pass: string;
}