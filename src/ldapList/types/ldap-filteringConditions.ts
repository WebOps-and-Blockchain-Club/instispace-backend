import { Field, InputType } from '@nestjs/graphql';
import { Gender } from './gender-enum';

@InputType()
export class LdapFilteringConditions {
  @Field({ nullable: true })
  search: String;

  @Field({ nullable: true })
  gender: Gender;

  @Field({ nullable: true })
  batch: String;

  @Field({ nullable: true })
  department: String;

  @Field({ nullable: true })
  program: String;
}
