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
  @Query(() => Course, {
    description:
      "Query to return course information according to the provided course code or name",
  })
  async getCourse(
    @Arg("Filter")
    search: string
  ) {
    try {
      let courseList = await Course.find();
      courseList = courseList.filter((course) =>
        JSON.stringify(course).toLowerCase().includes(search.toLowerCase()!)
      );
      return courseList[0];
    } catch (e) {
      throw new Error(`message : ${e}`);
    }
  }
  @Query(() => [String], {
    description:
      "Query to return a list of all the possible courses names or codes according to value provided (for dynamic search)",
  })
  async searchCourses(
    @Arg("Filter")
    search: string
  ) {
    try {
      let courseList = await Course.find();
      if (search.length >= 3) {
        courseList = courseList.filter((course) =>
          JSON.stringify(course).toLowerCase().includes(search.toLowerCase()!)
        );
        if (parseInt(search[2]))
          return courseList.map((course) => course.courseCode);
        else return courseList.map((course) => course.courseName);
      }

      throw new Error("Enter a search of atleast three characters");
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export default CoursesResolver;
