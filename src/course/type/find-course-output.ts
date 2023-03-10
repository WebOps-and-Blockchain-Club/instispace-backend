import { Field, ObjectType } from '@nestjs/graphql';
import { Course } from '../course.entity';

@ObjectType('getCourseOutput')
class getCourseOutput {
  @Field(() => [Course], { nullable: true })
  list: Course[];

  @Field(() => Number)
  total: number;
}

export default getCourseOutput;
