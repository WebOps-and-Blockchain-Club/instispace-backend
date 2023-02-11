import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Amenity from 'src/amenity/amenity.entity';
import HostelAnnouncement from 'src/hostelAnnouncement/hostelAnnouncement.entity';
import HostelContact from 'src/hostelContact/hostelContact.entity';
import { User } from 'src/user/user.entity';
import Hostel from './hostel.entity';
import HostelResolver from './hostel.resolver';
import HostelService from './hostel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Hostel,
      HostelAnnouncement,
      HostelContact,
      Amenity,
    ]),
  ],
  providers: [HostelResolver, HostelService],
  exports: [HostelService]
})
export class HostelModule { }
