import { Field, ObjectType } from '@nestjs/graphql';
import { LdapList } from '../ldapList.entity';

@ObjectType('getLdapUserOutput')
class getLdapUserOutput {
  @Field(() => [LdapList], { nullable: true })
  list: LdapList[];

  @Field(() => Number)
  total: number;
}

export default getLdapUserOutput;
