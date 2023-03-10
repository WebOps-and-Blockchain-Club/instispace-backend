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
    try {
      let hostel = this.hostelRepository.create();
      hostel.name = name;
      return this.hostelRepository.save(hostel);
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async getAll(ids?: string[]): Promise<Hostel[]> {
    try {
      if (ids) {
        let hostels: Hostel[] = [];
        ids.map(async (id: string) => {
          let hostel = await this.hostelRepository.findOne({ where: { id } });
          if (hostel) hostels.push(hostel);
        });
        return hostels;
      }
      return await this.hostelRepository.find();
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  async getOne(id: string) {
    try {
      return this.hostelRepository.findOne({
        where: { id: id },
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }

  users(id: string): Promise<User[]> {
    try {
      return this.userRepository.find({
        where: { id },
        relations: ['users'],
      });
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
  // async announcements(id): Promise<HostelAnnouncement[]> {
  //   let hostel = await this.announcementRepository.findOne({
  //     where: {hostels.id},
  //     relations: ['hostels'],
  //   });

  //   return hostel;
  // }

  async amenities(hostel): Promise<Amenity[]> {
    try {
      let list = await this.amenityRepository.find({
        where: { hostel },
        relations: ['hostel'],
      });
      return list;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
  async contacts(hostel): Promise<HostelContact[]> {
    try {
      let list = await this.contactRepository.find({
        where: { hostel },
        relations: ['hostel'],
      });
      return list;
    } catch (error) {
      throw new Error(`message : ${error}`);
    }
  }
}

export default HostelService;
