import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../../type/role.enum';

@InputType()
export class PermissionInput {
  @Field(() => [UserRole])
  account: UserRole[];

  @Field(() => [String])
  livePosts: string[];

  @Field(() => [String], { nullable: true })
  hostel: string[];

  @Field(() => Boolean, { nullable: true })
  createTag?: boolean;

  @Field(() => Boolean, { nullable: true })
  createNotification?: boolean;

  @Field(() => Boolean, { nullable: true })
  handleReports?: boolean;

  @Field(() => Boolean, { nullable: true })
  approvePosts?: boolean;
}
