import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from './types/gender-enum';
registerEnumType(Gender, { name: 'Gender' });

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
  gender: Gender;

  @Column()
  @Field()
  sem: String;

  @Column()
  @Field()
  program: String;

  @Column()
  @Field()
  advisor: String;

  @Column()
  @Field()
  residencyType: String;
}
