import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCourseInput {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  semester: string;

  @Field()
  venue: string;

  @Field()
  instructorName: string;

  @Field(() => [String], { description: 'slot of course + additional slots' })
  slots: string[];

  @Field(() => Date, { nullable: true })
  from: Date;

  @Field(() => Date, { nullable: true })
  to: Date;
}
