import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Amenity from "./Amenity";
import Announcement from "./Announcement";
import HostelContact from "./Contact";
import User from "./User";

@Entity("Hostel")
@ObjectType("Hostel", { description: "Hostel entity" })
class Hostel extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @Field({ description: "Unique uuid generated for each Hostel" })
  id: string;

  @Column({ unique: true })
  @Field({ description: "Hostel's name" })
  name: string;

  @OneToMany((_type) => User, (users) => users.hostel, { cascade: true })
  @Field((_type) => [User], {
    nullable: true,
    description: "Residents of The Hostel",
  })
  users: User[];

  @ManyToMany(
    (_type) => Announcement,
    (announcements) => announcements.hostels,
    {
      nullable: true,
    }
  )
  @Field((_type) => [Announcement], {
    nullable: true,
    description:
      "Hostel's Announcement, they will be displayed on the notice board",
  })
  announcements?: Announcement[];

  @OneToMany((_type) => HostelContact, (contacts) => contacts.hostel, {
    nullable: true,
  })
  @Field((_type) => [HostelContact], {
    nullable: true,
    description: "Contacts related to a Hostel",
  })
  contacts: HostelContact[];

  @OneToMany((_type) => Amenity, (amenities) => amenities.hostel, {
    nullable: true,
  })
  @Field((_type) => [Amenity], {
    nullable: true,
    description: "amenities for hostel",
  })
  amenities: Amenity[];
}

export default Hostel;
