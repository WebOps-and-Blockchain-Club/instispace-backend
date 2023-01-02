import { ComplaintCategory } from "../../utils/index";
import { Field, InputType } from "type-graphql";

@InputType()
class ComplaintInput {
  @Field({ description: "Complaint Title" })
  title: string;

  images?: string;

  @Field({ description: "Complaint's description" })
  description: string;

  @Field({ description: "Description of the location of the Complaint" })
  location: string;

  @Field((_type) => ComplaintCategory, {
    description: "Category of the Complaint",
  })
  category: ComplaintCategory;
}

@InputType()
class EditComplaintInput {
  @Field({ nullable: true, description: "Complaint Title" })
  title?: string;

  images?: string;

  @Field({ nullable: true, description: "Complaint Description" })
  description?: string;

  @Field({
    nullable: true,
    description: "Description of location of the issue",
  })
  location?: string;
}

@InputType()
class DeleteComplaintInput {
  resolutionImg?: string;

  @Field({
    nullable: true,
    description: "written Proof describing complaint resolution status",
  })
  resolutionDesc?: string;

  @Field({
    nullable: true,
    description: "Description of whether complaint is Resolved or not",
  })
  isResolved?: boolean;
}

export { ComplaintInput, EditComplaintInput, DeleteComplaintInput };
