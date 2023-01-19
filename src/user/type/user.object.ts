import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { UserRole } from './role.enum';
registerEnumType(UserRole, { name: 'UserRole' });

@ObjectType()
export class LoginOutput {
  @Field()
  accessToken: string;
}
