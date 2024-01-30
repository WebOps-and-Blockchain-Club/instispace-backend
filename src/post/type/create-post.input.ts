import { Field, InputType } from '@nestjs/graphql';
import Tag from 'src/tag/tag.entity';

@InputType()
export class CreatePostInput {
  @Field({ nullable: true })
  leadId: string;

  @Field({ nullable: true })
  title: string;

  @Field()
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

  @Field()
  category: string;

  @Field({ nullable: true })
  isVisibleToAll: boolean;

  @Field({ nullable: true })
  location: string;

  @Field(() => [String], { nullable: true })
  photoList: string[];

  @Field(() => Number, { nullable: true })
  pointsValue: Number;


  tags?: Tag[];
}
