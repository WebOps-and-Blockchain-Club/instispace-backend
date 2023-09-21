import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Ticket {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
