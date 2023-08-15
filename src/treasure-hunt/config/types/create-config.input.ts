import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateConfigInput {
  @Field()
  key: string;

  @Field()
  value: string;
}
