import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Hostel from "./Hostel";

@Entity("Contact")
@ObjectType("Contact")
class HostelContact extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  type: string;

  @Column()
  @Field()
  contact: string;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.contacts, { cascade: true })
  @Field((_type) => Hostel, { nullable: true })
  hostel: Hostel;
}

export default HostelContact;
