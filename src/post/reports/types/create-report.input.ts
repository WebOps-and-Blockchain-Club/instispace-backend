import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateReportInput {
  @Field()
  description: string;
}
