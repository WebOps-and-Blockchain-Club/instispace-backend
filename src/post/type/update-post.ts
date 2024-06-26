import { Field, InputType } from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';
import { PostStatus } from './postStatus.enum';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  endTime: Date;

  @Field({ nullable: true })
  postTime: Date;

  @Field({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  link: string;

  @Field(() => [String], { nullable: true })
  tagIds: string[];

  @Field({ nullable: true })
  category: string;

  @Field({ nullable: true })
  location: string;

  @Field(() => [String], { nullable: true })
  photoList: string[];

  tags?: Tag[];
}

@InputType()
export class PostStatusInput {
  @Field(() => PostStatus)
  status: PostStatus;
}
