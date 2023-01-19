import { CreateReportreasonInput } from './create-reportreason.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReportreasonInput extends PartialType(
  CreateReportreasonInput,
) {
  @Field({ description: 'Reason for the post bieng reported' })
  reason: string;

  @Field(() => Number, {
    description: 'Reports severity count',
    nullable: true,
  })
  count: number;
}
