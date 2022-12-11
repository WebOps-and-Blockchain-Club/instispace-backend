import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("Course")
@ObjectType("Course")
class Course extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Auto generated uuid" })
  id: string;

  @Column()
  @Field({
    description: "code related to the course",
  })
  courseCode: string;

  @Column()
  @Field({
    description: "name of the course",
  })
  courseName: string;

  @Column('text', { array: true })
  @Field(() => [String], { description: "list of all the slots the course is available in" })
  slots: string[];

  @Column('text', {array : true})
  @Field(() => [String])
  additionalSlots: string[];
}

export default Course;
