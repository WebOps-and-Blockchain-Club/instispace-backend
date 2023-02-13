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
