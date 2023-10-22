import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { User } from 'src/user/user.entity';
import { TicketStatus } from 'src/utils';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

registerEnumType(TicketStatus, { name: 'TicketStatus' });

@Entity()
@ObjectType()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  title: string;

  @Column()
  @Field()
  description: string;

  @Column({nullable:true})
  @Field({nullable:true})
  link:string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  imageUrls?: string;

  @Column({nullable:true})
  @Field({nullable:true})
  resolveDescription:string

  @ManyToOne(() => User, (user) => user.createdTickets)
  @Field(() => User)
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @Field(() => User, { nullable: true })
  resolvedBy?: User;

  @CreateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  @Field(() => Date)
  resolvedAt: Date;

  @Column('enum', { enum: TicketStatus, default: TicketStatus.PENDING })
  @Field(() => TicketStatus)
  status: TicketStatus;

  @Field(() => Boolean)
  canResolve: boolean;
}
