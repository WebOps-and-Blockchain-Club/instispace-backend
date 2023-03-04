import { CreateLdapListInput } from './create-ldap-list.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateLdapListInput extends PartialType(CreateLdapListInput) {
  @Field()
  roll: String;

  @Field()
  ldapName: String;

  @Field()
  gender: String;

  @Field()
  sem: String;

  @Field()
  program: String;
}
