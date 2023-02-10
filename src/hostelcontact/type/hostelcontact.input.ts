import { Field, InputType } from '@nestjs/graphql';

@InputType()
class CreateContactInput {
  @Field({ description: "Contact's type" })
  type: string;

  @Field({ description: 'name of the Person' })
  name: string;

  @Field({ description: 'Contact' })
  contact: string;
}

export { CreateContactInput };
