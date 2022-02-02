import Complaint from "../../entities/Complaint";
import { Field, ObjectType } from "type-graphql";

@ObjectType("getComplaintsOutput", {
  description: "Output type for getComplaints query",
})
class getComplaintsOutput {
  @Field(() => [Complaint], { nullable: true })
  complaintsList: Complaint[];

  @Field(() => Number)
  total: number;
}

export default getComplaintsOutput;
