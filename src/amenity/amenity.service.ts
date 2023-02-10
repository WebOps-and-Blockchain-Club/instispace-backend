import { InjectRepository } from '@nestjs/typeorm';
import Hostel from 'src/hostel/hostel.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Repository } from 'typeorm';
import Amenity from './amenity.entity';

class AmenityService {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
    @InjectRepository(Hostel)
    private hostelRepository: Repository<Hostel>,
    private readonly notificationService: NotificationService,
  ) {}

  async create({ name, description }, id: string) {
    const hostel = await this.hostelRepository.findOne({ where: { id } });
    if (!hostel) throw new Error('Invalid Hostel');

    let amenity = this.amenityRepository.create();
    amenity.name = name;
    amenity.description = description;
    amenity.hostel = hostel;
    let createdAmenity = this.amenityRepository.save(amenity);

    this.notificationService.notifyAmenity(createdAmenity);

    return createdAmenity;
  }
}

export default AmenityService;
