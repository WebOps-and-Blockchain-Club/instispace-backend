import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Hostel from 'src/hostel/hostel.entity';
import HostelContact from './hostelContact.entity';
import ContactResolver from './hostelContact.resolver';
import ContactService from './hostelContact.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hostel, HostelContact])],
  providers: [ContactResolver, ContactService],
})
export class HostelContactModule {}
