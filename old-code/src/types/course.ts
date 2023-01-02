import { Field, InputType } from "type-graphql";

@InputType()
class GetCourseInput {
  @Field({ nullable: true, description: "course number" })
  courseCode: string;

  @Field({ nullable: true, description: "name of the course" })
  courseName: string;
}

export {GetCourseInput}