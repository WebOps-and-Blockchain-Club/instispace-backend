import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Hostel from 'src/hostel/hostel.entity';
import HostelAnnouncement from './hostelAnnouncement.entity';
import HostelAnnouncementResolver from './hostelAnnouncement.resolver';
import HostelAnnouncementService from './hostelAnnouncement.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hostel, HostelAnnouncement])],
  providers: [HostelAnnouncementResolver, HostelAnnouncementService],
})
export class HostelAnnouncementModule {}
