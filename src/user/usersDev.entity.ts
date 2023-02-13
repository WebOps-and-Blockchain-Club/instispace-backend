import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('UsersDev')
@ObjectType('UsersDev', { description: "User's Dev List" })
class UsersDev extends BaseEntity {
  @PrimaryColumn()
  @Field({ description: 'Roll Number' })
  roll: string;

  @Column()
  @Field({ description: 'LDAP Display Name' })
  displayName: string;

  @Column()
  @Field({ description: 'Password' })
  pass: string;
}

export default UsersDev;
