import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Amenity from 'src/amenity/amenity.entity';
import HostelAnnouncement from 'src/hostelAnnouncement/hostelAnnouncement.entity';
import HostelContact from 'src/hostelContact/hostelContact.entity';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import Hostel from './hostel.entity';

@Injectable()
class HostelService {
  constructor(
    @InjectRepository(Hostel)
    private hostelRepository: Repository<Hostel>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(HostelAnnouncement)
    private announcementRepository: Repository<HostelAnnouncement>,
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
    @InjectRepository(HostelContact)
    private contactRepository: Repository<HostelContact>,
  ) {}

  create(name: string): Promise<Hostel> {
    let hostel = this.hostelRepository.create();
    hostel.name = name;
    return this.hostelRepository.save(hostel);
  }

  async getAll(ids?: string[]): Promise<Hostel[]> {
    if (ids) {
      let hostels: Hostel[] = [];
      ids.map(async (id: string) => {
        let hostel = await this.hostelRepository.findOne({ where: { id } });
        if (hostel) hostels.push(hostel);
      });
      return hostels;
    }
    return await this.hostelRepository.find();
  }

  users(id: string): Promise<User[]> {
    return this.userRepository.find({
      where: { id },
      relations: ['users'],
    });
  }
  // async announcements(id): Promise<HostelAnnouncement[]> {
  //   let hostel = await this.announcementRepository.findOne({
  //     where: {hostels.id},
  //     relations: ['hostels'],
  //   });

  //   return hostel;
  // }

  async amenities(hostel): Promise<Amenity[]> {
    let list = await this.amenityRepository.find({
      where: { hostel },
      relations: ['hostel'],
    });
    return list;
  }
  async contacts(hostel): Promise<HostelContact[]> {
    let list = await this.contactRepository.find({
      where: { hostel },
      relations: ['hostel'],
    });
    return list;
  }
}

export default HostelService;
