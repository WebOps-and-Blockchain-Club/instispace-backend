import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../post.entity';

@ObjectType('getPostOutput')
class getPostOutput {
  @Field(() => [Post], { nullable: true })
  list: Post[];

  @Field(() => Number)
  total: number;
}

export default getPostOutput;
