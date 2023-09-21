import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateTicketInput {
  @Field()
  title: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  imageUrls?: string;
}
