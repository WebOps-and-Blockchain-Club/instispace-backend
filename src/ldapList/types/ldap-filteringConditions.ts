import { Field, InputType } from '@nestjs/graphql';
import { Gender } from './gender-enum';

@InputType()
export class LdapFilteringConditions {
  @Field({ nullable: true })
  search: string;

  @Field({ nullable: true })
  gender: Gender;

  @Field({ nullable: true })
  batch: string;

  @Field({ nullable: true })
  department: string;

  @Field({ nullable: true })
  program: string;
}
