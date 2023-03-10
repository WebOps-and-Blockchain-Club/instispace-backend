import { InjectRepository } from '@nestjs/typeorm';
import { CreateAmenityInput } from 'src/amenity/type/amenity.input';
import Hostel from 'src/hostel/hostel.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import HostelAnnouncement from './hostelAnnouncement.entity';
import { createHostelAnnounceInput } from './type/hostelAnnouncement.input';

class HostelAnnouncementService {
  constructor(
    @InjectRepository(HostelAnnouncement)
    private announcementRepository: Repository<HostelAnnouncement>,
    @InjectRepository(Hostel)
    private hostelRepository: Repository<Hostel>,
  ) {}

  async create(
    {
      title,
      description,
      hostelIds,
      imageUrls,
      endTime,
    }: createHostelAnnounceInput,
    user: User,
  ) {
    try {
      let hostels: Hostel[] = [];
      let users: User[] = [];

      await Promise.all(
        hostelIds.map(async (id) => {
          const hostel = await this.hostelRepository.findOne({
            where: { id },
            relations: ['users'],
          });
          if (hostel) {
            hostels.push(hostel);
            users = users.concat(hostel.users);
          }
        }),
      );

      let announcement = this.announcementRepository.create();
      announcement.title = title;
      announcement.endTime = new Date(endTime);
      announcement.description = description;
      announcement.hostels = hostels;
      if (imageUrls) {
        let images = imageUrls.join(' AND ');
        announcement.images = images === '' ? null : images;
      }

      const announce = this.announcementRepository.save(announcement);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}

export default HostelAnnouncementService;
