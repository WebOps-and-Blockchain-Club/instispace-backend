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
  @Field()
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  images: string;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.amenities, { cascade: true })
  @Field((_type) => Hostel, { nullable: true })
  hostel: Hostel;
}

export default Amenity;
