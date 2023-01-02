import { EditDelPermission } from "../utils";
import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Hostel from "./Hostel";

@Entity("Amenity")
@ObjectType("Amenity")
class Amenity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Auto generated uuid for an Amenity" })
  id: string;

  @Column()
  @Field({ description: "Amenity's name" })
  name: string;

  @Column()
  @Field({ description: "Amenity image" })
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Amenity's visual description" })
  images: string;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.amenities, { cascade: true })
  @Field((_type) => Hostel, {
    description: "Hostel to which amenity is related",
  })
  hostel: Hostel;

  @Field(() => [EditDelPermission], { nullable: true })
  permissions: EditDelPermission[];
}

export default Amenity;
