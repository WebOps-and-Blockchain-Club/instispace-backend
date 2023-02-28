import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCalendarInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
