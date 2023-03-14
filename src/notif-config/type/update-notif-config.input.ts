import { CreateNotifConfigInput } from './create-notif-config.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateNotifConfigInput extends PartialType(CreateNotifConfigInput) {
  @Field(() => Int)
  id: number;
}
