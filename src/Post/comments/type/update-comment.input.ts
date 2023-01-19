import { CreateCommentInput } from './create-comment.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCommentInput extends PartialType(CreateCommentInput) {
  @Field(() => String, { nullable: true })
  content: string;

  @Field((_type) => Boolean, {
    description: 'Visiblity state of announcements',
    nullable: true,
  })
  isHidden: boolean;
}
