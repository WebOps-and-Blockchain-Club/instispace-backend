import fs from "fs";
import Course from "../entities/Course";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import path from "path";

@Resolver((_type) => Course)
class CoursesResolver {
  @Mutation(() => String)
  async createCourses() {
    const data = fs.readFileSync(
      path.join(__dirname, "..", "utils/coursedata.csv"),
      {
        encoding: "utf-8",
      }
    );
    const list = data.split("\n");
    var final: string[][] = [];
    for (let x of list) {
      let arr = x.replace("\r", "").split(">");
      final.push(arr);
    }
    final.shift();
    for (let y of final) {
      try {
        const course = new Course();
        course.slots = y[0].split(" ");
        course.additionalSlots = y[1].split(" ");
        course.courseCode = y[2];
        course.courseName = y[3];

        await course.save();
      } catch (e) {
        throw new Error(`message : ${e}`);
      }
    }
    return "Courses added";
  }

  @Query(() => [Course], {
    description:
      "Query to return a list of all courses that match the value provided",
  })
  async getCourses(
    @Arg("Filter", { nullable: true })
    search?: string
  ) {
    try {
      let courseList = await Course.find();
      if (search) {
        courseList = courseList.filter(({ courseCode, courseName }) =>
          JSON.stringify({ courseCode, courseName })
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        );
      }
      return courseList;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default CoursesResolver;
