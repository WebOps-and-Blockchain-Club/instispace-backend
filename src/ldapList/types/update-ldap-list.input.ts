import { CreateLdapListInput } from './create-ldap-list.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { Gender } from './gender-enum';

@InputType()
export class UpdateLdapListInput extends PartialType(CreateLdapListInput) {
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
