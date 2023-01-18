import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from '../../type/role.enum';

@InputType()
export class PermissionInput {
  @Field(() => [UserRole])
  account: UserRole[];

  @Field(() => [String])
  livePosts: string[];

  @Field(() => [String])
  unlivePosts: string[];
}
