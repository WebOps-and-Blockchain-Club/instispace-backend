import { IsEmail } from "class-validator";
import { Field, InputType } from "type-graphql";

@InputType({ description: "Input for createSec Mutation" })
class CreateSecInput {
  @Field({ description: "Hostel Secretory Email" })
  @IsEmail()
  roll: string;
}

@InputType({ description: "Input for Hostel" })
class CreateHostelInput {
  @Field({ description: "Hostel's name" })
  name: string;
}

export { CreateHostelInput, CreateSecInput };
