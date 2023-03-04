import { InputType, Int, Field } from '@nestjs/graphql';
import { Gender } from './gender-enum';

@InputType()
export class CreateLdapListInput {
  @Field()
  roll: String;

  @Field()
  ldapName: String;

  @Field()
  gender: Gender;

  @Field()
  sem: String;

  @Field()
  program: String;

  @Field()
  advisor: String;

  @Field()
  residencyType: String;
}
