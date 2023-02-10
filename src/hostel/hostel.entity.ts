import { Field, ObjectType } from '@nestjs/graphql';
import Amenity from 'src/amenity/amenity.entity';
import HostelAnnouncement from 'src/hostelAnnouncement/hostelAnnouncement.entity';
import HostelContact from 'src/hostelContact/hostelContact.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Hostel')
@ObjectType('Hostel', { description: 'Hostel entity' })
class Hostel {
  @PrimaryGeneratedColumn('uuid')
  @Field({ description: 'Unique uuid generated for each Hostel' })
  id: string;

  @Column({ unique: true })
  @Field({ description: "Hostel's name" })
  name: string;

  @OneToMany((_type) => User, (users) => users.hostel, { cascade: true })
  @Field((_type) => [User], {
    nullable: true,
    description: 'Residents of The Hostel',
  })
  users: User[];

  @ManyToMany(
    (_type) => HostelAnnouncement,
    (announcements) => announcements.hostels,
    {
      nullable: true,
    },
  )
  @Field((_type) => [HostelAnnouncement], {
    nullable: true,
    description:
      "Hostel's Announcement, they will be displayed on the notice board",
  })
  announcements?: HostelAnnouncement[];

  @OneToMany((_type) => HostelContact, (contacts) => contacts.hostel, {
    nullable: true,
  })
  @Field((_type) => [HostelContact], {
    nullable: true,
    description: 'Contacts related to a Hostel',
  })
  contacts: HostelContact[];

  @OneToMany((_type) => Amenity, (amenities) => amenities.hostel, {
    nullable: true,
  })
  @Field((_type) => [Amenity], {
    nullable: true,
    description: 'amenities for hostel',
  })
  amenities: Amenity[];
}

export default Hostel;
