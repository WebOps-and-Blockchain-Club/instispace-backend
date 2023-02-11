import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field()
  content: string;

  @Field()
  postId: string;

  @Field((_type) => Boolean, {
    description: 'Visiblity state of announcements',
  })
  isHidden: boolean;
}
