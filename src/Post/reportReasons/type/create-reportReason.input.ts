import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateReportreasonInput {
  @Field({ description: 'Reason for the post bieng reported' })
  reason: string;

  @Field(() => Number, {
    description: 'Reports severity count',
    nullable: true,
  })
  count: number;
}
