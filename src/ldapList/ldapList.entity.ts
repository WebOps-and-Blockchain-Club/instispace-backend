import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from './types/gender-enum';
registerEnumType(Gender, { name: 'Gender' });

@ObjectType()
@Entity('LdapList')
export class LdapList {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  roll: string;

  @Column()
  @Field()
  ldapName: string;

  @Column()
  @Field()
  gender: Gender;

  @Column()
  @Field()
  sem: string;

  @Column()
  @Field()
  program: string;

  @Column()
  @Field()
  advisor: string;

  @Column()
  @Field()
  residencyType: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  department: string;

  @Field()
  photo: string;
}
