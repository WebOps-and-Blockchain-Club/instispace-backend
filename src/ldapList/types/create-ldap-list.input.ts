import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateLdapListInput {
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
