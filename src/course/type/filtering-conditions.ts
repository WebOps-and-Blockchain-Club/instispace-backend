import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CourseFilteringConditions {
  @Field(() => Date, { nullable: true })
  date: Date;

  @Field({ nullable: true })
  slot: string;

  @Field({ nullable: true })
  code: string;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  semester: string;

  @Field({ nullable: true })
  search: string;
}
