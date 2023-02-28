import { CreateCourseInput } from './create-course.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field()
  semester: string;

  @Field()
  venue: string;

  @Field()
  instructorName: string;

  @Field(() => [String], { description: 'slot of course + additional slots' })
  slots: string[];

  @Field(() => Date)
  from: Date;

  @Field(() => Date)
  to: Date;
}
