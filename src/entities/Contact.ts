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
  @Field({ description: "Auto generated uuid" })
  id: string;

  @Column()
  @Field({
    description: "name of the person with whom the contact is related to",
  })
  name: string;

  @Column()
  @Field({
    description: "type of contact Warden-contact/secretory-contact etc.",
  })
  type: string;

  @Column()
  @Field({ description: "contact" })
  contact: string;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.contacts, { cascade: true })
  @Field((_type) => Hostel, {
    description: "relation which stores the contact-hostel",
  })
  hostel: Hostel;
}

export default HostelContact;
