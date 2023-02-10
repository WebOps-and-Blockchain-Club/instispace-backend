import { Field, InputType } from '@nestjs/graphql';

@InputType({ description: 'Input-Type for Create Notification Mutaion' })
class NotificationInput {
  @Field({ description: 'Title of Notification' })
  title: string;

  //   @Field((_type) => [String], { description: "Roles to be notified" })
  //   roles: UserRole[];

  @Field((_type) => [String], { nullable: true, description: 'Roll no.s' })
  rolls?: string[];

  @Field({ description: 'Body of Notification' })
  body: string;

  @Field({
    nullable: true,
    description: 'Images for Notification',
  })
  imageUrl: string;
}

export default NotificationInput;
