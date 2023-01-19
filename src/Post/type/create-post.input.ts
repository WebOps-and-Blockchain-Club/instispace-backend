import { Field, InputType } from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';

@InputType()
export class CreatePostInput {
  @Field({ nullable: true })
  title: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  endTime: Date;

  @Field({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  link: string;

  @Field(() => [String])
  tagIds: string[];

  @Field({ nullable: true })
  isHidden: boolean;

  @Field()
  category: string;

  @Field({ nullable: true })
  location: string;

  @Field({ nullable: true })
  Photo: string;

  tags?: Tag[];
}
