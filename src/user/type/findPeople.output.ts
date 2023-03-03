import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../user.entity';


@ObjectType('findPeopleOutput')
class findPeopleOutput {
  @Field(() => [User], { nullable: true })
  list: User[];

  @Field(() => Number)
  total: number;
}

export default findPeopleOutput;
