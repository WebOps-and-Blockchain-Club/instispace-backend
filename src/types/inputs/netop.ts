import { Field, InputType } from "type-graphql";

@InputType()
class CreateNetopsInput {
  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  photo: string;

  @Field()
  tags: string[];
}

@InputType()
class createCommentData {
  @Field()
  title: string;

  @Field()
  content: string;
}
̀
export default [CreateNetopsInput, createCommentData];
