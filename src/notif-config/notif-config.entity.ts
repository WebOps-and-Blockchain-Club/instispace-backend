import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('NotificationConfig')
export class NotifConfig {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  fcmToken: string;

  @ManyToOne(() => User, (user) => user.notifConfig, {
    cascade: true,
  })
  @Field(() => User)
  createdBy: User;
}
