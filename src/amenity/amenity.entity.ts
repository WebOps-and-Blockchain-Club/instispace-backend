import { Field, ObjectType } from '@nestjs/graphql';
import Hostel from 'src/hostel/hostel.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Amenity')
@ObjectType('Amenity')
class Amenity {
  @PrimaryGeneratedColumn('uuid')
  @Field({ description: 'Auto generated uuid for an Amenity' })
  id: string;

  @Column()
  @Field({ description: "Amenity's name" })
  name: string;

  @Column()
  @Field({ description: 'Amenity image' })
  description: string;

  @Column({ nullable: true })
  @Field({ nullable: true, description: "Amenity's visual description" })
  images: string;

  @ManyToOne((_type) => Hostel, (hostel) => hostel.amenities, { cascade: true })
  @Field((_type) => Hostel, {
    description: 'Hostel to which amenity is related',
  })
  hostel: Hostel;
}

export default Amenity;
