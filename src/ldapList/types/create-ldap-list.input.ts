import { InputType, Int, Field } from '@nestjs/graphql';
import { Gender } from './gender-enum';

@InputType()
export class CreateLdapListInput {
  @Field()
  roll: string;

  @Field()
  ldapName: string;

  @Field()
  gender: Gender;

  @Field()
  sem: string;

  @Field()
  program: string;

  @Field()
  advisor: string;

  @Field()
  residencyType: string;
}
