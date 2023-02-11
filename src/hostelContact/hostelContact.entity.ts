import { Field, ObjectType } from '@nestjs/graphql';
import Hostel from 'src/hostel/hostel.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('HostelContact')
@ObjectType('HostelContact')
class HostelContact {
  @PrimaryGeneratedColumn('uuid')
  @Field({ description: 'Auto generated uuid' })
  id: string;

  @Column()
  @Field({
    description: 'name of the person with whom the contact is related to',
  })
  name: string;

  @Column()
  @Field({
    description: 'type of contact Warden-contact/secretory-contact etc.',
  })
  type: string;

  @Column()
  @Field({ description: 'contact' })
  contact: string;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.contacts, { cascade: true })
  @Field((_type) => Hostel, {
    nullable: true,
    description: 'relation which stores the contact-hostel',
  })
  hostel: Hostel;
}

export default HostelContact;
