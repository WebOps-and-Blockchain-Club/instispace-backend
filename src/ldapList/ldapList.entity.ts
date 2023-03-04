import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity('LdapList')
export class LdapList {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: String;

  @Column()
  @Field()
  roll: String;

  @Column()
  @Field()
  ldapName: String;

  @Column()
  @Field()
  gender: String;

  @Column()
  @Field()
  sem: String;

  @Column()
  @Field()
  program: String;
}
