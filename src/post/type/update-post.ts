import { Field, InputType } from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  content: string;

  @Field({ nullable: true })
  endTime: Date;

  @Field({ nullable: true })
  linkName: string;

  @Field({ nullable: true })
  link: string;

  @Field(() => [String], { nullable: true })
  tagIds: string[];

  @Field({ nullable: true })
  isHidden: boolean;

  @Field({ nullable: true })
  category: string;

  @Field({ nullable: true })
  location: string;

  @Field({ nullable: true })
  Photo: string;

  tags?: Tag[];
}
