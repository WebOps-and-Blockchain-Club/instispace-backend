import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Hostel from 'src/hostel/hostel.entity';
import { NotificationModule } from 'src/notification/notification.module';
import Amenity from './amenity.entity';
import AmenityResolver from './amenity.resolver';
import AmenityService from './amenity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Hostel, Amenity]), NotificationModule],
  providers: [AmenityResolver, AmenityService],
})
export class AmenityModule {}
