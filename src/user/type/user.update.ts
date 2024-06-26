import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from './role.enum';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  mobile?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  photo?: string;

  @Field(() => [String], { nullable: true })
  interests?: string[];

  @Field({ nullable: true })
  forgotPassword?: string;
}
