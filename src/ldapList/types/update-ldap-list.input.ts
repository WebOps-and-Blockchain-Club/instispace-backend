import { CreateLdapListInput } from './create-ldap-list.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { Gender } from './gender-enum';

@InputType()
export class UpdateLdapListInput extends PartialType(CreateLdapListInput) {
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
